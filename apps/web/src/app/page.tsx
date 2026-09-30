export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-6 sm:px-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight">
          <span className="flex h-7 w-7 overflow-hidden rounded-full">
            <span className="w-1/2 bg-yes" />
            <span className="w-1/2 bg-no" />
          </span>
          viber predict
        </div>
        <span className="flex items-center gap-2 rounded-full bg-devnet px-3.5 py-2 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full bg-ink" />
          Devnet
        </span>
      </header>

      <section className="flex flex-col gap-6">
        <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-7xl">
          What happens next?
          <br />
          <span className="text-yes">Put SOL on it.</span>
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Open a YES/NO market on anything. Bet SOL on either side. Winners split the pool on-chain.
        </p>
      </section>

      <section className="rounded-[28px] bg-ink p-7 text-white">
        <p className="text-sm text-lime">Markets are coming online</p>
        <p className="mt-2 font-display text-3xl font-bold tracking-tight">
          Program deploying to Solana devnet.
        </p>
      </section>
    </main>
  );
}
