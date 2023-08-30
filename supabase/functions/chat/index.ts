import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { HumanMessage, AIMessage } from 'langchain/schema';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { LLMChain } from 'langchain/chains';
import {
  BufferMemory,
  ChatMessageHistory,
  CombinedMemory,
  VectorStoreRetrieverMemory,
} from 'langchain/memory';
import { CallbackManager } from 'langchain/callbacks';
import { PromptTemplate } from 'langchain/prompts';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

import { corsHeaders } from '../_shared/cors.ts';
import { createAdminClient, createClient } from '../_shared/supabase-client.ts';

const MODELS = {
  'gpt-3.5': 'gpt-3.5-turbo',
  'gpt-4': 'gpt-4',
};

// CONTROLS
const RECENT_MESSAGE_COUNT = 2;

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
    const supabaseAdmin = createAdminClient();
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
      return new Response(JSON.stringify({ error: 'Chat not found', input, message_id, chat_id }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const modelName = MODELS[chat.chat_model] ?? MODELS['gpt-3.5'];

    // Check if the request is for a streaming response.
    const streaming = req.headers.get('accept') === 'text/event-stream';

    /**
     * CONFIGURE MEMORY
     * * Most recent messages for immediate context
     * * Summary of conversation for long-term context
     * * Vector store for in-depth long term knowledge
     */

    // Get most recent messages for immediate context
    const { data: messages, error: messagesError } = await supabase
      .from('chat_message')
      .select('*')
      .eq('chat_id', chat_id)
      .neq('id', message_id) // Ensure we don't grab the message that is the input
      .order('created_at', { ascending: false })
      .limit(RECENT_MESSAGE_COUNT);

    if (messagesError || !messages) {
      return new Response(JSON.stringify({ error: 'Error Loading Previous Messages' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const bufferMemory = new BufferMemory({
      inputKey: 'input',
      memoryKey: 'recent_messages',
      chatHistory: new ChatMessageHistory(
        messages.map(m => {
          console.log('RECENT_MESSAGE', `${m.created_by}: ${m.message_text}`);
          if (m.created_by === 'ai') {
            return new AIMessage(m.message_text);
          }
          return new HumanMessage(m.message_text);
        }),
      ),
    });

    const vectorStore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
      client: supabaseAdmin,
      tableName: 'chat_memory',
      queryName: 'match_memory',
    });
    const vectorMemory = new VectorStoreRetrieverMemory({
      vectorStoreRetriever: vectorStore.asRetriever(5),
      memoryKey: 'vector_memory',
    });

    const memory = new CombinedMemory({
      memories: [bufferMemory, vectorMemory],
    });

    const PROMPT_TEMPLATE = `
    You are the StarFleet AI, used for general inquiries.Speak efficiently and clearly, but include specific details when relevant.
    If you do not know the answer to a question, you truthfully state that you do not know the answer.

    Summary of conversation:
    ${chat.memory_summary}

    Relevant pieces of previous conversation (this information may be ignored if not relevant):
    {vector_memory}

    Recent messages:
    {recent_messages}

    New user input:
    {input}

    AI: `;

    const prompt = new PromptTemplate({
      inputVariables: ['input', 'vector_memory', 'recent_messages'],
      template: PROMPT_TEMPLATE,
    });

    if (streaming) {
      // For a streaming response we need to use a TransformStream to
      // convert the LLM's callback-based API into a stream-based API.
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      let fullText = '';

      const llm = new ChatOpenAI({
        modelName,
        streaming,
        callbackManager: CallbackManager.fromHandlers({
          handleLLMNewToken: async token => {
            await writer.ready;
            fullText += token;
            try {
              await writer.write(encoder.encode(`data: ${token}\n\n`));
            } catch (e) {
              console.error(e);
              await writer.abort(e);
            }
          },
          handleLLMEnd: async () => {
            await writer.ready;
            await writer.close();
            await supabaseAdmin
              .from('chat_message')
              .insert({ chat_id, id: message_id, message_text: fullText, created_by: 'ai' });
            const newMemorySummary = await getNewMemorySummary(
              chat.memory_summary,
              input,
              fullText,
            );
            await supabaseAdmin
              .from('chat')
              .update({ memory_summary: newMemorySummary })
              .eq('id', chat_id);
          },
          handleLLMError: async e => {
            await writer.ready;
            await writer.abort(e);
          },
        }),
      });
      const chain = new LLMChain({ prompt, llm, memory });
      // We don't need to await the result of the chain.run() call because
      // the LLM will invoke the callbackManager's handleLLMEnd() method
      chain.call({ input }).catch(e => console.error(e));

      return new Response(stream.readable, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    } else {
      // For a non-streaming response we can just await the result of the
      // chain.run() call and return it.
      const llm = new ChatOpenAI({
        modelName,
      });
      const chain = new LLMChain({ prompt, llm, memory });
      const response = await chain.call({ input });

      await supabaseAdmin
        .from('chat_message')
        .insert({ chat_id, id: message_id, message_text: response.text, created_by: 'ai' });
      const newMemorySummary = await getNewMemorySummary(chat.memory_summary, input, response.text);
      await supabaseAdmin
        .from('chat')
        .update({ memory_summary: newMemorySummary })
        .eq('id', chat_id);

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

async function getNewMemorySummary(
  oldSummary: string,
  newHumanMessage: string,
  newAIMessage: string,
): Promise<string> {
  const prompt = new PromptTemplate({
    inputVariables: ['input'],
    template: `
    Progressively summarize the lines of conversation provided, altering the current summary returning a new summary. The summary should never exceed 500 characters, if it would, condense the summary of older parts of the conversation to make room for the new summary.

    EXAMPLE
    Current summary:
    The human asks what the AI thinks of artificial intelligence. The AI thinks artificial intelligence is a force for good, the clarifies at the human's request to understand why stating that it will help humans reach their full potential.
    
    New lines of conversation:
    Human: What are some useful ways that artificial intelligence could be used to reach this?
    AI: Artificial intelligence could be used by humans to enable them to be more efficient in the repetitive tasks as part of their day to day lives.
    
    New summary:
    The human and the AI discuss artificial intelligence and its ability to help humans reach their full potential. The human asks the AI for examples of how AI can help reach potential, the AI responds that AI can help humans be more efficient in their day to day lives.
    END OF EXAMPLE
    
    Current summary:
    {input}
    
    New lines of conversation:
    Human: ${newHumanMessage}
    AI: ${newAIMessage}
    
    New summary:
    `,
  });

  const llm = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
  });
  const chain = new LLMChain({ prompt, llm });

  try {
    const response = await chain.call({ input: oldSummary });
    return response.text;
  } catch (e) {
    console.error(e);
    return oldSummary;
  }
}
