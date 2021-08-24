import { atom } from 'jotai';
import deepEqual from 'fast-deep-equal';
import { atomFamily, waitForAll } from 'jotai/utils';
import BigNumber from 'bignumber.js';
import {
  currentAccountAvailableStxBalanceState,
  currentAccountBalancesUnanchoredState,
  currentAccountStxAddressState,
  currentAnchoredAccountBalancesState,
} from '@store/accounts';
import { transformAssets } from '@store/assets/utils';
import { Asset, AssetWithMeta, ContractPrincipal, NftMeta } from '@common/asset-types';
import { assetMetaDataState } from '@store/assets/fungible-tokens';
import { contractInterfaceState } from '@store/contracts';
import { isSip10Transfer } from '@common/token-utils';
import { currentNetworkState } from '@store/networks';

const transferDataState = atomFamily<ContractPrincipal, any>(
  ({ contractAddress, contractName }) => {
    const anAtom = atom(get => {
      const contractInterface = get(contractInterfaceState({ contractName, contractAddress }));
      if (!contractInterface) return;
      return isSip10Transfer(contractInterface);
    });
    anAtom.debugLabel = `transferDataState/${contractAddress}.${contractName}`;
    return anAtom;
  },
  deepEqual
);

export const assetItemState = atomFamily<[Asset, string], AssetWithMeta>(([asset, networkUrl]) => {
  const anAtom = atom(get => {
    if (asset.type === 'ft') {
      const transferData = get(
        transferDataState({
          contractName: asset.contractName,
          contractAddress: asset.contractAddress,
        })
      );
      const meta = get(
        assetMetaDataState({
          contractAddress: asset.contractAddress,
          contractName: asset.contractName,
          networkUrl,
        })
      );
      const canTransfer = !(!transferData || 'error' in transferData);
      const hasMemo = transferData && !('error' in transferData) && transferData.hasMemo;
      return { ...asset, meta, canTransfer, hasMemo } as AssetWithMeta;
    }
    return asset as AssetWithMeta;
  });
  anAtom.debugLabel = `assetItemState/${asset.contractAddress}.${asset.contractName}::${asset.name}`;
  return anAtom;
}, deepEqual);

export const baseAssetsAnchoredState = atom(get => {
  const balances = get(currentAnchoredAccountBalancesState);
  return transformAssets(balances);
});

export const assetsAnchoredState = atom(get => {
  const network = get(currentNetworkState);
  const transformed = get(baseAssetsAnchoredState);
  return get(waitForAll(transformed.map(asset => assetItemState([asset, network.url]))));
});

export const baseAssetsUnanchoredState = atom(get => {
  const balances = get(currentAccountBalancesUnanchoredState);
  return transformAssets(balances);
});
export const assetsUnanchoredState = atom(get => {
  const network = get(currentNetworkState);
  const transformed = get(baseAssetsUnanchoredState);
  return get(waitForAll(transformed.map(asset => assetItemState([asset, network.url]))));
});

export const transferableAssetsState = atom(get =>
  get(assetsAnchoredState)?.filter(asset => asset.canTransfer)
);

function makeKey(address: string, name: string) {
  return `${address}.${name}`;
}

export const mergeAssetBalances = (
  anchoredAssets: AssetWithMeta[],
  unanchoredAssets: AssetWithMeta[],
  assetType: string
) => {
  const assetMap = new Map();
  // Merge both balances (unanchored and anchored)
  anchoredAssets.forEach(
    asset =>
      asset.type === assetType &&
      assetMap.set(makeKey(asset.contractAddress, asset.contractName), {
        ...asset,
        ...{ subBalance: new BigNumber(0) },
      })
  );
  unanchoredAssets.forEach(asset => {
    if (asset.type !== assetType) return;
    const key = makeKey(asset.contractAddress, asset.contractName);
    const match = assetMap.get(key);
    if (match) {
      match.subBalance = asset?.balance;
    } else {
      assetMap.set(key, {
        ...asset,
        subBalance: asset.balance,
        balance: new BigNumber(0),
      });
    }
  });
  return [...assetMap.values()] as AssetWithMeta[];
};

export const fungibleTokensBaseState = atom(get => {
  const principal = get(currentAccountStxAddressState);
  if (!principal) return [];
  const anchoredAssets: AssetWithMeta[] = get(baseAssetsAnchoredState);
  const unanchoredAssets: AssetWithMeta[] = get(baseAssetsUnanchoredState);
  return mergeAssetBalances(anchoredAssets, unanchoredAssets, 'ft');
});

export const fungibleTokensState = atom(get => {
  const principal = get(currentAccountStxAddressState);
  if (!principal) return [];
  const anchoredAssets: AssetWithMeta[] = get(assetsAnchoredState);
  const unanchoredAssets: AssetWithMeta[] = get(assetsUnanchoredState);
  return mergeAssetBalances(anchoredAssets, unanchoredAssets, 'ft');
});

export type NftMetaRecord = Record<string, NftMeta>;

export const mergeNftBalances = (anchoredNfts: NftMetaRecord, unanchoredNfts: NftMetaRecord) => {
  const assets = Object.keys(anchoredNfts);
  const assetMap = new Map();
  // Merge both balances (unanchored and anchored)
  assets.forEach(asset =>
    assetMap.set(asset, { ...anchoredNfts[asset], ...{ subCount: '0', key: asset } })
  );

  Object.keys(unanchoredNfts).forEach(key => {
    const asset = unanchoredNfts[key];
    if (!assetMap.has(key)) {
      assetMap.set(key, { ...asset, ...{ subCount: asset.count, count: '0', key } });
    } else {
      assetMap.get(key).subCount = asset.count;
    }
  });

  return [...assetMap.values()];
};

export const nonFungibleTokensState = atom(get => {
  const anchoredbalances = get(currentAnchoredAccountBalancesState);
  const unanchoredBalances = get(currentAccountBalancesUnanchoredState);

  const anchoredNfts = anchoredbalances?.non_fungible_tokens || {};
  const unanchoredNfts = unanchoredBalances?.non_fungible_tokens || {};
  const noCollectibles =
    Object.keys(anchoredNfts).length === 0 && Object.keys(unanchoredNfts).length === 0;

  if (noCollectibles) return [];
  return mergeNftBalances(anchoredNfts, unanchoredNfts);
});

export const stxTokenState = atom(get => {
  const balance = get(currentAccountAvailableStxBalanceState);
  const unanchoredBalances = get(currentAccountBalancesUnanchoredState);

  return {
    type: 'stx',
    contractAddress: '',
    balance: balance,
    subBalance: unanchoredBalances?.stx?.balance.minus(unanchoredBalances?.stx.locked) || undefined,
    subtitle: 'STX',
    name: 'Stacks Token',
  } as AssetWithMeta;
});

assetsAnchoredState.debugLabel = 'assetsState';
transferableAssetsState.debugLabel = 'transferableAssetsState';
fungibleTokensState.debugLabel = 'fungibleTokensState';
nonFungibleTokensState.debugLabel = 'nonFungibleTokensState';
stxTokenState.debugLabel = 'stxTokenState';
