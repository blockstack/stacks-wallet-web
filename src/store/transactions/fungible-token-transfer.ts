import { atom } from 'jotai';
import { selectedAssetStore } from '@store/assets/asset-search';
import {
  currentAccountBalancesState,
  currentAccountState,
  currentAccountStxAddressState,
} from '@store/accounts';
import { currentStacksNetworkState } from '@store/networks';
import { currentAccountNonceState } from '@store/accounts/nonce';

export const makeFungibleTokenTransferState = atom(get => {
  const asset = get(selectedAssetStore);
  const currentAccount = get(currentAccountState);
  const network = get(currentStacksNetworkState);
  const balances = get(currentAccountBalancesState);
  const stxAddress = get(currentAccountStxAddressState);
  const nonce = get(currentAccountNonceState);
  if (!stxAddress || typeof nonce === 'undefined') return;

  if (asset && currentAccount && stxAddress) {
    const { contractName, contractAddress, name: assetName } = asset;
    return {
      asset,
      stxAddress,
      nonce,
      balances,
      network,
      senderKey: currentAccount.stxPrivateKey,
      assetName,
      contractAddress,
      contractName,
    };
  }
  return;
});

makeFungibleTokenTransferState.debugLabel = 'makeFungibleTokenTransferState';
