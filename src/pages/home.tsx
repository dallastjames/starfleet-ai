import { createEffect, createSignal } from 'solid-js';
import { useSupabaseClient, useUser } from '../utils/supabase';
import { useNavigate } from '@solidjs/router';
import { useToast } from '../utils/toast';

export default function HomePage() {
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [user] = useUser();

  createEffect(() => {
    if (!!user()) {
      navigate('/chat', { replace: true });
    }
  });

  function onFormSubmit(e: SubmitEvent) {
    e.preventDefault();
    tryLogin();
  }

  async function tryLogin() {
    if (!email() || !password()) {
      toast.error('Please enter a valid email and password');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email(),
      password: password(),
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    navigate('/chat', { replace: true });
  }

  return (
    <>
      <div class="flex h-screen w-screen flex-col items-center justify-center">
        <div class="prose mb-4">
          <h1 class="w-full text-center">Star Fleet AI</h1>
        </div>
        <div class="card w-72 bg-neutral shadow-xl lg:w-96">
          <form class="card-body" onSubmit={onFormSubmit}>
            <input
              type="email"
              placeholder="Email"
              class="input input-bordered w-full"
              value={email()}
              onInput={e => setEmail(e.currentTarget.value)}
            />
            <input
              type="password"
              placeholder="Password"
              class="input input-bordered mt-4 w-full"
              value={password()}
              onInput={e => setPassword(e.currentTarget.value)}
            />
            <div class="card-actions justify-center">
              <button class="btn btn-primary mt-4 w-48">Open Chat</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
