import { useCallback } from 'react';

import BtcAvatarIconSrc from '@assets/avatars/btc-avatar-icon.png';

import { type SwapAsset, useCryptoCurrencyMarketDataMeanAverage } from '@leather.io/query';

import { useBtcCryptoAssetBalanceNativeSegwit } from '@app/query/bitcoin/balance/btc-balance-native-segwit.hooks';
import { useCurrentAccountNativeSegwitIndexZeroSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

export function useBtcSwapAsset() {
  const nativeSegwitSigner = useCurrentAccountNativeSegwitIndexZeroSigner();
  const currentBitcoinAddress = nativeSegwitSigner.address;
  const { balance } = useBtcCryptoAssetBalanceNativeSegwit(currentBitcoinAddress);
  const bitcoinMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');

  return useCallback((): SwapAsset => {
    return {
      balance: balance.availableBalance,
      tokenId: 'token-btc',
      displayName: 'Bitcoin',
      fallback: 'BT',
      icon: BtcAvatarIconSrc,
      name: 'BTC',
      marketData: bitcoinMarketData,
      principal: '',
    };
  }, [balance.availableBalance, bitcoinMarketData]);
}
