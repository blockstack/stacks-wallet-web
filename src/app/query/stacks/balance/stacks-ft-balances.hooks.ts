import { useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import BigNumber from 'bignumber.js';

import type { StacksFungibleTokenAssetBalance } from '@shared/models/crypto-asset-balance.model';

import { formatContractId } from '@app/common/utils';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { useGetFungibleTokenMetadataListQuery } from '../tokens/fungible-tokens/fungible-token-metadata.query';
import { isFtAsset } from '../tokens/token-metadata.utils';
import {
  addQueriedMetadataToInitializedStacksFungibleTokenAssetBalance,
  convertFtBalancesToStacksFungibleTokenAssetBalanceType,
  createStacksCryptoCurrencyAssetTypeWrapper,
  createStacksFtCryptoAssetBalanceTypeWrapper,
} from './stacks-ft-balances.utils';
import { parseBalanceResponse } from './stx-balance.hooks';
import { useStacksAccountBalanceQuery } from './stx-balance.query';

export function useStacksCryptoCurrencyAssetBalance(address: string) {
  return useStacksAccountBalanceQuery(address, {
    select: resp =>
      createStacksCryptoCurrencyAssetTypeWrapper(parseBalanceResponse(resp).stx.unlockedStx.amount),
  });
}

function useStacksFungibleTokenAssetBalances(address: string) {
  return useStacksAccountBalanceQuery(address, {
    select: resp => convertFtBalancesToStacksFungibleTokenAssetBalanceType(resp.fungible_tokens),
  });
}

export function useStacksFungibleTokenAssetBalancesWithMetadata(address: string) {
  const { data: initializedAssetBalances = [] } = useStacksFungibleTokenAssetBalances(address);

  const ftAssetsMetadata = useGetFungibleTokenMetadataListQuery(
    initializedAssetBalances.map(assetBalance =>
      formatContractId(assetBalance.asset.contractAddress, assetBalance.asset.contractName)
    )
  );

  return useMemo(
    () =>
      initializedAssetBalances.map((assetBalance, i) => {
        const metadata = ftAssetsMetadata[i].data;
        if (!(metadata && isFtAsset(metadata))) return assetBalance;
        return addQueriedMetadataToInitializedStacksFungibleTokenAssetBalance(
          assetBalance,
          metadata
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initializedAssetBalances]
  );
}

export function useStacksFungibleTokenAssetBalance(contractId: string) {
  const account = useCurrentStacksAccount();
  const navigate = useNavigate();
  const assetBalances = useStacksFungibleTokenAssetBalancesWithMetadata(account?.address ?? '');
  return useMemo(() => {
    const balance = assetBalances.find(assetBalance =>
      assetBalance.asset.contractId.includes(contractId)
    );
    if (!balance) {
      toast.error('Unable to find balance by contract id');
      navigate('..');
    }
    return balance ?? createStacksFtCryptoAssetBalanceTypeWrapper(new BigNumber(0), contractId);
  }, [assetBalances, contractId, navigate]);
}

export function useTransferableStacksFungibleTokenAssetBalances(
  address: string
): StacksFungibleTokenAssetBalance[] {
  const assetBalances = useStacksFungibleTokenAssetBalancesWithMetadata(address);
  return useMemo(
    () => assetBalances.filter(assetBalance => assetBalance.asset.canTransfer),
    [assetBalances]
  );
}
