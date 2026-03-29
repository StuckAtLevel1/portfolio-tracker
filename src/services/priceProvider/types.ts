export interface PriceQuote {
  symbol: string;
  price: number;
}

export interface PriceProvider {
  name: string;
  fetchPrices(symbols: string[]): Promise<PriceQuote[]>;
}
