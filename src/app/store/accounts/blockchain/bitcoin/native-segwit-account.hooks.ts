import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { HDKey } from '@scure/bip32';
import * as btc from 'micro-btc-signer';

import { deriveAddressIndexZeroFromAccount } from '@shared/crypto/bitcoin/bitcoin.utils';
import { deriveNativeSegWitReceiveAddressIndex } from '@shared/crypto/bitcoin/p2wpkh-address-gen';
import { isUndefined } from '@shared/utils';

import {
  formatBitcoinAccount,
  tempHardwareAccountForTesting,
} from '@app/store/accounts/blockchain/bitcoin/bitcoin-account.models';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useCurrentAccountIndex } from '../../account';
import { selectSoftwareBitcoinNativeSegWitKeychain } from './bitcoin-keychain';

function useBitcoinNativeSegwitAccount(index: number) {
  const keychain = useSelector(selectSoftwareBitcoinNativeSegWitKeychain);
  return useMemo(() => {
    // TODO: Remove with bitcoin Ledger integration
    if (isUndefined(keychain)) return tempHardwareAccountForTesting;
    return formatBitcoinAccount(keychain(index))(index);
  }, [keychain, index]);
}

function useCurrentBitcoinNativeSegwitAccount() {
  const currentAccountIndex = useCurrentAccountIndex();
  return useBitcoinNativeSegwitAccount(currentAccountIndex);
}

function useDeriveNativeSegWitAccountIndexAddressIndexZero(xpub: string) {
  const network = useCurrentNetwork();
  return useMemo(
    () =>
      deriveNativeSegWitReceiveAddressIndex({
        xpub,
        network: network.chain.bitcoin.network,
      }),
    [xpub, network]
  );
}

export function useCurrentBtcNativeSegwitAccountAddressIndexZero() {
  const { xpub } = useCurrentBitcoinNativeSegwitAccount();
  return useDeriveNativeSegWitAccountIndexAddressIndexZero(xpub)?.address as string;
}

export function useBtcNativeSegwitAccountIndexAddressIndexZero(accountIndex: number) {
  const { xpub } = useBitcoinNativeSegwitAccount(accountIndex);
  return useDeriveNativeSegWitAccountIndexAddressIndexZero(xpub)?.address as string;
}

function useCurrentBitcoinNativeSegwitAccountKeychain() {
  const { xpub } = useCurrentBitcoinNativeSegwitAccount();
  const keychain = HDKey.fromExtendedKey(xpub);
  if (!keychain?.publicKey) throw new Error('No public key for given keychain');
  if (!keychain.pubKeyHash) throw new Error('No pub key hash for given keychain');
  return keychain;
}

// Concept of current address index won't exist with privacy mode
export function useCurrentBitcoinNativeSegwitAddressIndexKeychain() {
  const keychain = useCurrentBitcoinNativeSegwitAccountKeychain();
  return deriveAddressIndexZeroFromAccount(keychain);
}

export function useSignBitcoinNativeSegwitTx() {
  const index = useCurrentAccountIndex();
  const keychain = useSelector(selectSoftwareBitcoinNativeSegWitKeychain)?.(index);
  return useCallback(
    (tx: btc.Transaction) => {
      if (isUndefined(keychain)) return;
      tx.sign(deriveAddressIndexZeroFromAccount(keychain).privateKey!);
    },
    [keychain]
  );
}
