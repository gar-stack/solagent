# Deployment Guide (Vercel Manual)

## Prerequisites

- Vercel account
- Vercel CLI installed (`npm i -g vercel`)
- Project built and tests passing

## Environment Variables

Set these in Vercel project settings:

- `VITE_SOLANA_RPC_URL` (example: `https://api.devnet.solana.com`)
- `VITE_OPERATOR_WALLETS` (comma-separated wallet addresses)
- `VITE_ADMIN_WALLETS` (comma-separated wallet addresses)
- `VITE_APP_URL` (your final production URL after first deploy)

## First Deploy

```bash
vercel
```

Follow prompts to link the local repo to your Vercel project.

## Production Deploy

```bash
vercel --prod
```

## Post-Deploy Checklist

1. Open `/`, `/docs`, and `/dashboard` directly with hard refresh.
2. Verify disconnected users are blocked from dashboard.
3. Connect Phantom, Solflare, and Backpack from wallet modal.
4. Verify role-based behavior:
   - `viewer`: read-only
   - `operator`: agent controls
   - `admin`: control-plane actions
5. Confirm footer `Live App` link opens the deployed URL.
