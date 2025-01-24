import { useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import type { Token } from 'bitflow-sdk';

import { type Currency, createMarketData, createMarketPair } from '@leather.io/models';
import {
  type SwapAsset,
  useAlexSdkLatestPricesQuery,
  useStxAvailableUnlockedBalance,
  useTransferableSip10Tokens,
} from '@leather.io/query';
import { getPrincipalFromAssetString } from '@leather.io/stacks';
import { convertAmountToFractionalUnit, createMoney, isDefined } from '@leather.io/utils';

import { useSip10FiatMarketData } from '@app/common/hooks/use-calculate-sip10-fiat-value';
import { createGetBitflowAvailableTokensQueryOptions } from '@app/query/bitflow-sdk/bitflow-available-tokens.query';

import { sortSwapAssets } from '../swap.utils';

const alexStxTokenId: Currency = 'token-wstx';
const bitflowStxTokenId: Currency = 'token-stx';
const usdDecimalPrecision = 2;

function useCreateSwapAsset(address: string) {
  const { data: prices } = useAlexSdkLatestPricesQuery();
  const { getTokenMarketData } = useSip10FiatMarketData();
  const availableUnlockedBalance = useStxAvailableUnlockedBalance(address);
  const sip10Tokens = useTransferableSip10Tokens(address);

  return useCallback(
    (token?: Token): SwapAsset | undefined => {
      if (!prices || !token || !token.tokenContract) return;
      const pricesKeyedByCurrency = prices as Record<Currency, number>;
      const stxPrice = pricesKeyedByCurrency[alexStxTokenId] ?? 0;

      const swapAsset = {
        tokenId: token.tokenId,
        fallback: token.symbol.slice(0, 2),
        icon: token.icon,
        name: token.symbol,
        displayName: token.name,
        principal: token.tokenContract,
      };

      if (token.tokenId === bitflowStxTokenId) {
        const price = convertAmountToFractionalUnit(new BigNumber(stxPrice), usdDecimalPrecision);
        return {
          ...swapAsset,
          balance: availableUnlockedBalance,
          displayName: 'Stacks',
          marketData: createMarketData(
            createMarketPair(availableUnlockedBalance.symbol, 'USD'),
            createMoney(price, 'USD')
          ),
        };
      }

      const availableBalance = sip10Tokens.find(
        sip10Token =>
          getPrincipalFromAssetString(sip10Token.info.contractId) === token.tokenContract
      )?.balance.availableBalance;

      return {
        ...swapAsset,
        balance: availableBalance ?? createMoney(0, token.symbol, token.tokenDecimals),
        marketData: availableBalance
          ? getTokenMarketData(swapAsset.principal, availableBalance.symbol)
          : getTokenMarketData(swapAsset.principal, token.symbol),
      };
    },
    [availableUnlockedBalance, getTokenMarketData, prices, sip10Tokens]
  );
}

export function useBitflowSwappableAssets(address: string) {
  const createSwapAsset = useCreateSwapAsset(address);
  return useQuery({
    ...createGetBitflowAvailableTokensQueryOptions(),
    select: resp => sortSwapAssets(resp.map(createSwapAsset).filter(isDefined)),
  });
}
