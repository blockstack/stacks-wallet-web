import { useMemo } from 'react';

import { type MarketData, createMarketData, createMarketPair } from '@leather.io/models';
import {
  useAlexCurrencyPriceAsMarketData,
  useCryptoCurrencyMarketDataMeanAverage,
} from '@leather.io/query';
import { getPrincipalFromAssetString } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { useConfigSbtc } from '@app/query/common/remote-config/remote-config.query';

function castBitcoinMarketDataToSbtcMarketData(bitcoinMarketData: MarketData) {
  return createMarketData(
    createMarketPair('sBTC', 'USD'),
    createMoney(bitcoinMarketData.price.amount.toNumber(), 'USD')
  );
}

export function useSip10FiatMarketData() {
  const priceAsMarketData = useAlexCurrencyPriceAsMarketData();
  const bitcoinMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const { isSbtcContract } = useConfigSbtc();

  return useMemo(
    () => ({
      getTokenMarketData(identifier: string, symbol: string) {
        const lookupIdentifier = identifier.includes('::')
          ? getPrincipalFromAssetString(identifier)
          : identifier;

        if (isSbtcContract(lookupIdentifier)) {
          return castBitcoinMarketDataToSbtcMarketData(bitcoinMarketData);
        }

        return priceAsMarketData(lookupIdentifier, symbol);
      },
    }),
    [bitcoinMarketData, isSbtcContract, priceAsMarketData]
  );
}
