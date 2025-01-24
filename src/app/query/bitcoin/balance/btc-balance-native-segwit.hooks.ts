import { useMemo } from 'react';

import BigNumber from 'bignumber.js';

import { useNativeSegwitUtxosByAddress, useRunesEnabled } from '@leather.io/query';
import { createMoney, isUndefined, sumNumbers } from '@leather.io/utils';

import { useInscribedSpendableUtxos } from '@app/features/discarded-inscriptions/use-inscribed-spendable-utxos';
import { useCurrentAccountNativeSegwitIndexZeroSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { useFilterNativeSegwitInscriptions } from '../ordinals/inscriptions/inscriptions.query';

const defaultZeroValues = {
  protectedBalance: createMoney(0, 'BTC'),
  uneconomicalBalance: createMoney(0, 'BTC'),
  inboundBalance: createMoney(0, 'BTC'),
  outboundBalance: createMoney(0, 'BTC'),
  pendingBalance: createMoney(0, 'BTC'),
  unspendableBalance: createMoney(0, 'BTC'),
};

export function useBtcCryptoAssetBalanceNativeSegwit(address: string) {
  const runesEnabled = useRunesEnabled();

  const spendableInscriptionUtxos = useInscribedSpendableUtxos();

  const { filterOutInscriptions: filterOutNativeSegwitInscriptions } =
    useFilterNativeSegwitInscriptions();

  const totalUtxosQuery = useNativeSegwitUtxosByAddress({
    address,
    filterInscriptionUtxos: false,
    filterPendingTxsUtxos: true,
    filterRunesUtxos: runesEnabled,
  });

  const balance = useMemo(() => {
    if (isUndefined(totalUtxosQuery.data) || isUndefined(totalUtxosQuery.data))
      return {
        ...defaultZeroValues,
        totalBalance: createMoney(new BigNumber(0), 'BTC'),
        availableBalance: createMoney(new BigNumber(0), 'BTC'),
      };
    return {
      ...defaultZeroValues,
      totalBalance: createMoney(sumNumbers(totalUtxosQuery.data.map(utxo => utxo.value)), 'BTC'),
      availableBalance: createMoney(
        // Here we add back in the utxos that are spending because they've been discarded
        sumNumbers(
          [
            ...filterOutNativeSegwitInscriptions(totalUtxosQuery.data),
            ...spendableInscriptionUtxos,
          ].map(utxo => utxo.value)
        ),
        'BTC'
      ),
    };
  }, [totalUtxosQuery.data, filterOutNativeSegwitInscriptions, spendableInscriptionUtxos]);

  return { ...totalUtxosQuery, balance };
}

export function useCurrentBtcCryptoAssetBalanceNativeSegwit() {
  const nativeSegwitSigner = useCurrentAccountNativeSegwitIndexZeroSigner();
  return useBtcCryptoAssetBalanceNativeSegwit(nativeSegwitSigner.address);
}
