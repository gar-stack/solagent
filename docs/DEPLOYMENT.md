# Deployment Guide (Vercel GitHub Auto-Deploy)

## Prerequisites

- Vercel account
- Project built and tests passing
- GitHub repository connected to Vercel

## Environment Variables

Set these in Vercel project settings:

- `VITE_SOLANA_RPC_URL` (example: `https://api.devnet.solana.com`)
- `VITE_OPERATOR_WALLETS` (comma-separated wallet addresses)
- `VITE_ADMIN_WALLETS` (comma-separated wallet addresses)
- `VITE_APP_URL` (your production domain, e.g. `https://your-project.vercel.app`)

## Deployment Flow

1. Connect the repository in Vercel.
2. Set environment variables.
3. Push to `main` to trigger production deployment.
4. Create pull requests to get preview deployments automatically.

## Post-Deploy Checklist

1. Open `/`, `/docs`, and `/dashboard` directly with hard refresh.
2. Verify disconnected users are blocked from dashboard.
3. Connect Phantom, Solflare, and Backpack from wallet modal.
4. Verify role-based behavior:
   - `viewer`: read-only
   - `operator`: agent controls
   - `admin`: control-plane actions
5. Confirm footer `Live App` link opens the deployed URL.
