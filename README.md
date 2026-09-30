# Viber Predict

Prediction market on Solana, built at the Superteam Kazakhstan × Solana × Viber hackathon (Astana, 30 Sep 2026, 2 hours of build).
Anyone creates a YES/NO market, anyone bets SOL on either side, winners split the pool.

**Network: Solana DEVNET only.** No mainnet in this build.

## Live

- Web: https://viber-predict.vercel.app (Vercel project `viber-predict`)
- Mobile: Android APK for Solana Seeker, installed over USB

## How it works

Parimutuel pool, SOL collateral:

1. `create_market` — anyone opens a YES/NO question with a close time.
2. `place_bet(side, lamports)` — SOL goes into the market vault until close.
3. `resolve(outcome)` — the creator resolves after close (admin can override if the creator is silent).
4. `claim` — winners get `stake / winning_pool × total_pool`, minus 2% fee (1% creator, 1% treasury).
5. `void` — market cancelled, everyone refunded. Auto-void if nobody bet on the winning side.

Shown to users: chance of YES = YES pool / total pool; payout multiplier = 0.98 / chance.

Guardrails: max 1 SOL per bet, admin pause, checked arithmetic.

## Repository layout

```
programs/prediction   Anchor 0.32 program (Rust)
packages/sdk          TS client: IDL, PDAs, tx builders — shared by web and mobile
apps/web              Next.js (App Router) + Tailwind + Solana wallet-adapter → Vercel
apps/mobile           Expo 54 dev build + Mobile Wallet Adapter → APK for Seeker
scripts/              helper scripts (android-env.sh)
keys/                 program keypair — gitignored, never commit
```

Some folders appear as the hackathon progresses; check git log.

## Accounts (on-chain)

| Account | PDA seeds | Holds |
|---|---|---|
| `Config` | `["config"]` | admin, fee bps, treasury, paused, max bet |
| `Market` | `["market", creator, id]` | question (≤200 chars), end_ts, yes/no pools, status, outcome, source url |
| `Vault` | `["vault", market]` | market SOL |
| `Position` | `["position", market, user]` | yes/no stake, claimed flag |

Program ID (devnet): `2fQQbhFHMUrw9D17t4bdK1ULzyfz5tzWZUKKoHFqMLM3`
Deployer / admin wallet: `BK4Tt9kZfazEs3DRzyygpDKP4mN7PyuWduUEJStUPRHc`

## RPC and load

- Primary RPC: Helius devnet. The API key lives only in server env (`HELIUS_API_KEY`), never in client code or the APK.
- Clients read markets from `/api/markets` (CDN cache 3–5 s) instead of calling `getProgramAccounts` directly — one RPC call per few seconds regardless of user count.
- `/api/rpc` proxies RPC calls for the web app and the APK.
- Every transaction carries a priority fee.

## Wallets

- Web: `@solana/wallet-adapter` (Phantom, Solflare, Backpack via Wallet Standard; MWA in Android Chrome).
- Seeker: Mobile Wallet Adapter (Seed Vault Wallet, Phantom, Solflare). Stack copied from a working Seeker app: Expo 54, RN 0.81.5, `@solana-mobile/mobile-wallet-adapter-protocol` 2.2.6 + postinstall patch. Authorize with chain `solana:devnet`.

## Design

Light theme, warm paper background `#F4F2EC`, white cards, ink `#15161A`.
YES blue `#2459FF`, NO coral `#FF5A1F`, primary CTA lime `#D7FF3D` with dark text.
Fonts: Bricolage Grotesque (headings, big numbers), Geist (text), Geist Mono (SOL, odds, addresses).
Screens: markets feed with featured event banners, market + bet panel, create market, positions + claim, settings, "You won" + shareable P&L card (1200×900) and story (540×960).

## Run locally

```bash
cd apps/web
pnpm install
cp .env.example .env.local   # fill HELIUS_API_KEY
pnpm dev
```

Program:

```bash
anchor build
anchor deploy --provider.cluster devnet
```

Mobile (needs JDK 17 + Android SDK, phone connected by USB):

```bash
source scripts/android-env.sh
cd apps/mobile && npx expo run:android
```

## Deploy

Rule for this project: **every change is deployed to Vercel right away.**

```bash
cd apps/web
vercel deploy --prod --yes
```

Env vars on Vercel: `HELIUS_API_KEY`.

## Secrets

Never commit `.env*`, `keys/`, or any keypair JSON. They are in `.gitignore`.
