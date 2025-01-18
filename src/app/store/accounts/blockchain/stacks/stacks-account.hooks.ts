import { useMemo } from 'react';

import { useAtomValue } from 'jotai';

import {
  legacyStackWallet,
  stacksAccountState,
} from '@app/store/accounts/blockchain/stacks/stacks-accounts';
import { useSignatureRequestAccountIndex } from '@app/store/signatures/requests.hooks';
import { useTransactionRequestState } from '@app/store/transactions/requests.hooks';

import { hasSwitchedAccountsState, useCurrentAccountIndex } from '../../account';
import type { StacksAccount } from './stacks-account.models';

export function useStacksAccounts() {
  return useAtomValue(stacksAccountState);
}

// TODO: Refactor, we need to use conditional empty strings everywhere
// Can we remove these atoms?

// Comment below from original atom. This pattern encourages view level
// implementation details to leak into the state structure. Do not do this.
//   This contains the state of the current account:
//   could be the account associated with an in-process transaction request
//   or the last selected / first account of the user
export function useCurrentStacksAccount() {
  const accountIndex = useCurrentAccountIndex();
  const txIndex = useTransactionAccountIndex();
  const signatureIndex = useSignatureRequestAccountIndex();
  // ⚠️ to refactor, we should not just continually add new conditionals here
  const hasSwitched = useAtomValue(hasSwitchedAccountsState);
  const accounts = useStacksAccounts();

  return useMemo(() => {
    const index = txIndex ?? signatureIndex;
    if (!accounts) return undefined;
    if (typeof index === 'number' && !hasSwitched) return accounts[index];
    return accounts[accountIndex] as StacksAccount | undefined;
  }, [accountIndex, accounts, hasSwitched, signatureIndex, txIndex]);
}

export function useCurrentStacksAccountAddress() {
  return useCurrentStacksAccount()?.address ?? '';
}

export function useTransactionAccountIndex() {
  const accounts = useAtomValue(stacksAccountState);
  const txPayload = useTransactionRequestState();
  const txAddress = txPayload?.stxAddress;
  return useMemo(() => {
    if (txAddress && accounts) {
      return accounts.findIndex(account => account.address === txAddress); // selected account
    }
    return undefined;
  }, [accounts, txAddress]);
}

/**
 * @deprecated
 * This exists only to serve the remaining Gaia functionality.
 * Do not perpetuate its use.
 */
export function useLegacyStacksWallet() {
  return useAtomValue(legacyStackWallet);
}
