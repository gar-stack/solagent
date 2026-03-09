const JUPITER_QUOTE_URL = 'https://quote-api.jup.ag/v6/quote';
const COINGECKO_SIMPLE_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price';

export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export interface SolMarketSnapshot {
  source: 'jupiter+coingecko' | 'coingecko-only';
  priceUsd: number;
  priceChange24h: number;
  volume24hUsd: number;
  estimatedLiquidityUsd: number;
  timestamp: number;
}

interface JupiterQuoteResponse {
  outAmount: string;
  priceImpactPct?: string;
}

interface CoinGeckoSolanaResponse {
  solana?: {
    usd?: number;
    usd_24h_change?: number;
    usd_24h_vol?: number;
  };
}

function clampNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

async function fetchJupiterSolUsdPrice(): Promise<{ priceUsd: number; estimatedLiquidityUsd: number }> {
  const lamportsForOneSol = 1_000_000_000;
  const params = new URLSearchParams({
    inputMint: SOL_MINT,
    outputMint: USDC_MINT,
    amount: String(lamportsForOneSol),
    slippageBps: '50',
    swapMode: 'ExactIn',
  });
  const response = await fetch(`${JUPITER_QUOTE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Jupiter quote request failed (${response.status})`);
  }

  const quote = (await response.json()) as JupiterQuoteResponse;
  const outAmount = Number(quote.outAmount);
  if (!Number.isFinite(outAmount) || outAmount <= 0) {
    throw new Error('Jupiter quote returned invalid amount');
  }

  const priceUsd = outAmount / 1_000_000;
  const priceImpact = clampNumber(quote.priceImpactPct ? Number(quote.priceImpactPct) : 0, 0);
  const estimatedLiquidityUsd = Math.max(priceUsd * 1_000_000 * (1 - Math.abs(priceImpact)), 0);

  return { priceUsd, estimatedLiquidityUsd };
}

async function fetchCoinGeckoSolMetrics(): Promise<{ priceUsd: number; priceChange24h: number; volume24hUsd: number }> {
  const params = new URLSearchParams({
    ids: 'solana',
    vs_currencies: 'usd',
    include_24hr_change: 'true',
    include_24hr_vol: 'true',
  });
  const response = await fetch(`${COINGECKO_SIMPLE_PRICE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`CoinGecko request failed (${response.status})`);
  }

  const payload = (await response.json()) as CoinGeckoSolanaResponse;
  const sol = payload.solana;
  if (!sol?.usd) {
    throw new Error('CoinGecko response missing SOL price');
  }

  return {
    priceUsd: clampNumber(sol.usd, 0),
    priceChange24h: clampNumber(sol.usd_24h_change, 0),
    volume24hUsd: clampNumber(sol.usd_24h_vol, 0),
  };
}

export async function fetchSolMarketSnapshot(): Promise<SolMarketSnapshot> {
  const coinGecko = await fetchCoinGeckoSolMetrics();
  try {
    const jupiter = await fetchJupiterSolUsdPrice();
    return {
      source: 'jupiter+coingecko',
      priceUsd: jupiter.priceUsd,
      priceChange24h: coinGecko.priceChange24h,
      volume24hUsd: coinGecko.volume24hUsd,
      estimatedLiquidityUsd: jupiter.estimatedLiquidityUsd,
      timestamp: Date.now(),
    };
  } catch {
    return {
      source: 'coingecko-only',
      priceUsd: coinGecko.priceUsd,
      priceChange24h: coinGecko.priceChange24h,
      volume24hUsd: coinGecko.volume24hUsd,
      estimatedLiquidityUsd: coinGecko.volume24hUsd * 0.1,
      timestamp: Date.now(),
    };
  }
}
