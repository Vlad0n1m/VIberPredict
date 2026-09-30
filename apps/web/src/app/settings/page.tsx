"use client";

import { useState } from "react";
import { wallet } from "@/lib/markets";

export default function SettingsPage() {
  const [note, setNote] = useState("");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 pt-4 sm:pt-8">
      <h1 className="mb-2 font-display text-[40px] font-extrabold leading-none tracking-tighter sm:text-6xl">Settings</h1>

      <div className="flex flex-col gap-3.5 rounded-[26px] bg-ink p-5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15161A" strokeWidth="2" aria-hidden>
              <rect x="3" y="6" width="18" height="13" rx="3" />
              <path d="M16 12.5h2" />
            </svg>
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-xs text-[#a9a69e]">Connected wallet</span>
            <span className="font-mono text-[15px]">{wallet.short}</span>
          </div>
          <span className="font-mono text-[15px]">{wallet.balance.toFixed(2)} SOL</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setNote("Address copied.")} className="h-11 rounded-full border border-[#3a3b40] text-sm">
            Copy address
          </button>
          <button type="button" className="h-11 rounded-full border border-[#3a3b40] text-sm text-[#ff8a5c]">
            Disconnect
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-[26px] bg-card p-5">
        <span className="text-[13px] font-semibold">Network</span>
        <div className="flex items-center gap-2 text-[15px] font-semibold">
          <span className="h-2 w-2 rounded-full bg-devnet" />
          Solana Devnet
        </div>
        <span className="text-xs leading-relaxed text-muted">This build runs on devnet only. All SOL here is free test SOL.</span>
      </div>

      <div className="flex items-center justify-between rounded-[26px] bg-devnet py-4 pl-5 pr-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold">Devnet faucet</span>
          <span className="text-xs">1 test SOL, free</span>
        </div>
        <button type="button" onClick={() => setNote("Airdrop requested.")} className="h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white">
          Airdrop
        </button>
      </div>

      {note && <p className="text-center text-sm text-muted">{note}</p>}
      <p className="mt-6 px-1 font-mono text-[11px] text-muted">program 2fQQ…LM3 · devnet · v0.1</p>
    </main>
  );
}
