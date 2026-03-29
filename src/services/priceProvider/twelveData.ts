import type { PriceProvider, PriceQuote } from './types';

export function createTwelveDataProvider(apiKey: string): PriceProvider {
  return {
    name: 'twelveData',

    async fetchPrices(symbols: string[]): Promise<PriceQuote[]> {
      if (symbols.length === 0) return [];

      const url = `https://api.twelvedata.com/price?symbol=${symbols.join(',')}&apikey=${apiKey}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Twelve Data API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      // Global error (e.g. 429 rate limit)
      if (data.code && data.status === 'error') {
        throw new Error(`Twelve Data API error (${data.code}): ${data.message}`);
      }

      // API returns different formats for single vs multiple symbols
      if (symbols.length === 1) {
        // Single symbol: { "price": "150.00" } or { "code": 400, "message": "..." }
        if (data.code) {
          console.warn(`Twelve Data: failed to fetch ${symbols[0]}: ${data.message}`);
          return [];
        }
        return [{ symbol: symbols[0], price: parseFloat(data.price) }];
      }

      // Multiple symbols: { "AAPL": { "price": "150.00" }, "MSFT": { "price": "300.00" } }
      const results: PriceQuote[] = [];
      for (const symbol of symbols) {
        const item = data[symbol];
        if (item && item.price) {
          results.push({ symbol, price: parseFloat(item.price) });
        } else if (item && item.code) {
          console.warn(`Twelve Data: failed to fetch ${symbol}: ${item.message}`);
        }
      }
      return results;
    },
  };
}
