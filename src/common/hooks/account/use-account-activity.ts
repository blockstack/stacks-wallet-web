import { currentAccountTransactionsState } from '@store/accounts';
import { useAtomValue } from 'jotai/utils';

export function useAccountActivity() {
  return useAtomValue(currentAccountTransactionsState);
}
