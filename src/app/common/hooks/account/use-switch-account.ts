import { useCallback } from 'react';

import { useHasSwitchedAccounts } from '@app/store/accounts/account';
import {
  useCurrentStacksAccount,
  useStacksAccounts,
  useTransactionAccountIndex,
} from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { trackSwitchAccount } from '../../analytics/track-switch-account';
import { useKeyActions } from '../use-key-actions';

const TIMEOUT = 350;

export function useSwitchAccount(callback?: () => void) {
  const { switchAccount } = useKeyActions();
  const currentAccount = useCurrentStacksAccount();
  const accounts = useStacksAccounts();
  const txIndex = useTransactionAccountIndex();
  const [hasSwitched, setHasSwitched] = useHasSwitchedAccounts();

  const handleSwitchAccount = useCallback(
    async (index: number) => {
      setHasSwitched(true);
      switchAccount(index);
      if (callback) setTimeout(() => callback(), TIMEOUT);
      if (!accounts) return;
      void trackSwitchAccount(accounts[index]?.address, index);
    },
    [setHasSwitched, switchAccount, callback, accounts]
  );

  const getIsActive = useCallback(
    (index: number) =>
      typeof txIndex === 'number' && !hasSwitched
        ? index === txIndex
        : index === currentAccount?.index,
    [txIndex, hasSwitched, currentAccount]
  );

  return { handleSwitchAccount, getIsActive };
}
