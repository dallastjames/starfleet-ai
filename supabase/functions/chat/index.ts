import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { LLMChain } from 'langchain/chains';
import { CallbackManager } from 'langchain/callbacks';
import { ChatPromptTemplate, HumanMessagePromptTemplate } from 'langchain/prompts';

import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient, createClient } from '../_shared/supabase-client.ts';

const prompt = ChatPromptTemplate.fromPromptMessages([
  HumanMessagePromptTemplate.fromTemplate('{input}'),
]);

serve(async req => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { input, message_id, chat_id } = await req.json();
    if (!input || !message_id || !chat_id) {
      return new Response(JSON.stringify({ error: 'Missing input, message_id, or chat_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(req);
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: chat, error: chatError } = await supabase
      .from('chat')
      .select('*')
      .eq('id', chat_id)
      .single();
    if (chatError || !chat) {
      return new Response(JSON.stringify({ error: 'Chat not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminSupabase = createAdminClient();

    // Check if the request is for a streaming response.
    const streaming = req.headers.get('accept') === 'text/event-stream';

    if (streaming) {
      // For a streaming response we need to use a TransformStream to
      // convert the LLM's callback-based API into a stream-based API.
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      let fullText = '';

      const llm = new ChatOpenAI({
        streaming,
        callbackManager: CallbackManager.fromHandlers({
          handleLLMNewToken: async token => {
            await writer.ready;
            fullText += token;
            await writer.write(encoder.encode(`data: ${token}\n\n`));
          },
          handleLLMEnd: async () => {
            await writer.ready;
            await writer.close();
            await adminSupabase
              .from('chat_message')
              .insert({ chat_id, id: message_id, message_text: fullText, created_by: 'ai' });
          },
          handleLLMError: async e => {
            await writer.ready;
            await writer.abort(e);
          },
        }),
      });
      const chain = new LLMChain({ prompt, llm });
      // We don't need to await the result of the chain.run() call because
      // the LLM will invoke the callbackManager's handleLLMEnd() method
      chain.call({ input }).catch(e => console.error(e));

      return new Response(stream.readable, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    } else {
      // For a non-streaming response we can just await the result of the
      // chain.run() call and return it.
      const llm = new ChatOpenAI();
      const chain = new LLMChain({ prompt, llm });
      const response = await chain.call({ input });

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
