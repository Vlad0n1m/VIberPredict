"use client";

import Link from "next/link";
import { useState } from "react";
import { ShareCard } from "@/components/share-card";
import { getMarket, positions, wallet } from "@/lib/markets";

export default function WinPage() {
  const [note, setNote] = useState("");
  const pos = positions.find((p) => p.claimable)!;
  const m = getMarket(pos.marketId)!;
  const payout = pos.claimable!;
  const profit = payout - pos.stake;
  const pnl = Math.round((profit / pos.stake) * 100);
  const odds = payout / pos.stake;
  const calledAt = Math.round((0.98 / odds) * 100);

  const url = typeof window !== "undefined" ? `${window.location.origin}/market/${m.id}` : "";
  const text = `I called it on Viber Predict: +${profit.toFixed(2)} SOL (+${pnl}%) on "${m.question}"`;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Viber Predict", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setNote("Copied — paste it anywhere.");
    } catch {
      /* user closed the share sheet */
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setNote("Link copied.");
    } catch {
      setNote(url);
    }
  }

  return (
    <main className="relative -mb-24 flex flex-1 flex-col overflow-hidden bg-ink pb-24 text-white md:mb-0 md:pb-12">
      <svg width="390" height="300" viewBox="0 0 390 300" className="pointer-events-none absolute left-0 top-0" aria-hidden>
        <rect x="40" y="60" width="10" height="20" rx="2" fill="#D7FF3D" transform="rotate(24 45 70)" />
        <rect x="320" y="40" width="10" height="20" rx="2" fill="#FF5A1F" transform="rotate(-30 325 50)" />
        <rect x="350" y="180" width="10" height="20" rx="2" fill="#2459FF" transform="rotate(40 355 190)" />
        <rect x="24" y="210" width="10" height="20" rx="2" fill="#2459FF" transform="rotate(-18 29 220)" />
        <rect x="250" y="20" width="8" height="16" rx="2" fill="#D7FF3D" transform="rotate(60 254 28)" />
        <circle cx="300" cy="120" r="5" fill="#D7FF3D" />
        <circle cx="80" cy="140" r="4" fill="#FF5A1F" />
      </svg>
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pt-8 md:flex-row md:items-center md:gap-12 md:pt-16">
        <div className="flex flex-col gap-2.5 md:w-[380px] md:shrink-0">
          <span className="text-sm text-[#a9a69e]">Claimed to {wallet.short}</span>
          <h1 className="font-display text-[46px] font-extrabold leading-[0.95] tracking-tighter md:text-6xl">You called it.</h1>
          <span className="font-display text-[64px] font-extrabold leading-none tracking-tighter text-lime">+{profit.toFixed(2)} SOL</span>
          <span className="font-mono text-sm text-lime">
            +{pnl}% · you were in the {calledAt}%
          </span>
          <div className="mt-6 hidden flex-col gap-2.5 md:flex">
            <Actions onShare={share} onCopy={copyLink} />
          </div>
        </div>
        <div className="flex-1">
          <ShareCard
            question={m.question}
            side={pos.side === "yes" ? "Yes" : "No"}
            odds={`${odds.toFixed(2)}×`}
            profit={`+${profit.toFixed(2)} SOL`}
            pnl={`+${pnl}%`}
            calledAt={`${calledAt}% chance`}
            stake={`${pos.stake.toFixed(2)} SOL`}
            payout={`${payout.toFixed(2)} SOL`}
          />
        </div>
        <div className="flex flex-col gap-2.5 md:hidden">
          <Actions onShare={share} onCopy={copyLink} />
        </div>
      </div>
      {note && <p className="relative mt-3 text-center text-sm text-lime">{note}</p>}
    </main>
  );
}

function Actions({ onShare, onCopy }: { onShare: () => void; onCopy: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onShare}
        className="flex h-[60px] items-center justify-center gap-2.5 rounded-full bg-lime text-[17px] font-semibold text-ink transition-transform duration-150 active:scale-[0.98]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15161A" strokeWidth="2.2" aria-hidden>
          <path d="M12 3v13M6 9l6-6 6 6M5 21h14" />
        </svg>
        Share win
      </button>
      <button type="button" onClick={onCopy} className="h-12 rounded-full border border-[#3a3b40] text-sm">
        Copy market link
      </button>
      <Link href="/" className="py-2 text-center text-sm text-[#a9a69e]">
        Find the next market
      </Link>
    </>
  );
}
