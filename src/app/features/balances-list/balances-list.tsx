import { Box, Stack, StackProps, Text } from '@stacks/ui';
import { HomePageSelectorsLegacy } from '@tests-legacy/page-objects/home.selectors';

import { useBtcAssetBalance } from '@app/common/hooks/balance/btc/use-btc-balance';
import { useStxBalance } from '@app/common/hooks/balance/stx/use-stx-balance';
import { ftDecimals } from '@app/common/stacks-utils';
import { useWalletType } from '@app/common/use-wallet-type';
import { CryptoCurrencyAssetItem } from '@app/components/crypto-assets/crypto-currency-asset/crypto-currency-asset-item';
import { StxAvatar } from '@app/components/crypto-assets/stacks/components/stx-avatar';
import { BtcIcon } from '@app/components/icons/btc-icon';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { Caption } from '@app/components/typography';
import { Brc20TokensLoader } from '@app/features/balances-list/components/brc-20-tokens-loader';
import { useConfigBitcoinEnabled } from '@app/query/common/hiro-config/hiro-config.query';
import { useStacksFungibleTokenAssetBalancesAnchoredWithMetadata } from '@app/query/stacks/balance/stacks-ft-balances.hooks';
import { useCurrentAccountNativeSegwitAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { Collectibles } from '../collectibles/collectibles';
import { BitcoinFungibleTokenAssetList } from './components/bitcoin-fungible-tokens-asset-list';
import { StacksFungibleTokenAssetList } from './components/stacks-fungible-token-asset-list';

interface BalancesListProps extends StackProps {
  address: string;
}

export function BalancesList({ address, ...props }: BalancesListProps) {
  const stacksFtAssetBalances = useStacksFungibleTokenAssetBalancesAnchoredWithMetadata(address);
  const isBitcoinEnabled = useConfigBitcoinEnabled();
  const btcAddress = useCurrentAccountNativeSegwitAddressIndexZero();
  const {
    stxEffectiveBalance,
    stxEffectiveUsdBalance,
    stxLockedBalance,
    stxUsdLockedBalance,
    isLoading,
  } = useStxBalance();
  const { btcAvailableAssetBalance, btcAvailableUsdBalance } = useBtcAssetBalance(btcAddress);
  const { whenWallet } = useWalletType();

  // Better handle loading state
  if (isLoading) return <LoadingSpinner />;

  const stxAdditionalBalanceInfo = stxLockedBalance?.amount.isGreaterThan(0) ? (
    <Text>({ftDecimals(stxLockedBalance.amount, stxLockedBalance.decimals || 0)} locked)</Text>
  ) : undefined;

  const stxAdditionalUsdBalanceInfo = stxLockedBalance?.amount.isGreaterThan(0) ? (
    <Caption ml="4px">({stxUsdLockedBalance} locked)</Caption>
  ) : undefined;

  return (
    <Stack
      pb="extra-loose"
      spacing="loose"
      data-testid={HomePageSelectorsLegacy.BalancesList}
      {...props}
    >
      {isBitcoinEnabled && (
        <CryptoCurrencyAssetItem
          assetBalance={btcAvailableAssetBalance}
          usdBalance={btcAvailableUsdBalance}
          icon={<Box as={BtcIcon} />}
          address={btcAddress}
        />
      )}
      <CryptoCurrencyAssetItem
        assetBalance={stxEffectiveBalance}
        usdBalance={stxEffectiveUsdBalance}
        address={address}
        additionalBalanceInfo={stxAdditionalBalanceInfo}
        additionalUsdBalanceInfo={stxAdditionalUsdBalanceInfo}
        icon={<StxAvatar {...props} />}
      />
      <StacksFungibleTokenAssetList assetBalances={stacksFtAssetBalances} />
      {whenWallet({
        software: (
          <Brc20TokensLoader>
            {brc20Tokens => <BitcoinFungibleTokenAssetList brc20Tokens={brc20Tokens} />}
          </Brc20TokensLoader>
        ),
        ledger: null,
      })}

      <Collectibles />
    </Stack>
  );
}
