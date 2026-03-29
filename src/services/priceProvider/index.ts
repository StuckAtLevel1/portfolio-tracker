import type { PriceProvider } from './types';
import { createTwelveDataProvider } from './twelveData';

export type { PriceProvider, PriceQuote } from './types';

export type ProviderType = 'twelveData';

export function createPriceProvider(type: ProviderType, apiKey: string): PriceProvider {
  switch (type) {
    case 'twelveData':
      return createTwelveDataProvider(apiKey);
    default:
      throw new Error(`Unknown price provider: ${type}`);
  }
}
