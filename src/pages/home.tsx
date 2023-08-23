import { A } from "@solidjs/router";

export default function HomePage() {
  return (
    <>
      <div class="flex flex-col items-center justify-center h-screen w-screen">
        <div class="prose mb-4">
          <h1 class="text-center w-full">Star Fleet AI</h1>
        </div>
        <div class="card w-96 bg-neutral shadow-xl">
          <div class="card-body">
            <div class="card-actions justify-center">
              <A href="/chat" class="btn btn-neutral">
                Open Chat
              </A>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
