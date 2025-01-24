import { useCallback } from 'react';

import { StacksTransaction, broadcastTransaction } from '@stacks/transactions-v6';

import { delay, isError } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { analytics } from '@shared/utils/analytics';

import { useRefreshAllAccountData } from '@app/common/hooks/account/use-refresh-all-account-data';
import { useLoading } from '@app/common/hooks/use-loading';
import { safelyFormatHexTxid } from '@app/common/utils/safe-handle-txid';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentStacksNetworkStateV6 } from '@app/store/networks/networks.hooks';

const timeForApiToUpdate = 250;

interface UseSubmitTransactionArgs {
  loadingKey: string;
}
interface UseSubmitTransactionCallbackV6Args {
  replaceByFee?: boolean;
  onSuccess(txId: string): void;
  onError(error: Error | string): void;
}
export function useSubmitTransactionCallbackV6({ loadingKey }: UseSubmitTransactionArgs) {
  const toast = useToast();
  const refreshAccountData = useRefreshAllAccountData();

  const { setIsLoading, setIsIdle } = useLoading(loadingKey);
  const stacksNetwork = useCurrentStacksNetworkStateV6();

  return useCallback(
    ({ onSuccess, onError }: UseSubmitTransactionCallbackV6Args) =>
      async (transaction: StacksTransaction) => {
        setIsLoading();
        try {
          const response = await broadcastTransaction(transaction, stacksNetwork);
          if (response.error) {
            logger.error('Transaction broadcast', response);
            if (response.reason) toast.error('Broadcast error');
            onError(response.error);
            setIsIdle();
          } else {
            logger.info('Transaction broadcast', response);

            await delay(500);

            void analytics.track('broadcast_transaction', {
              symbol: 'stx',
            });
            onSuccess(safelyFormatHexTxid(response.txid));
            setIsIdle();
            await refreshAccountData(timeForApiToUpdate);
          }
        } catch (error) {
          logger.error('Transaction callback', { error });
          onError(isError(error) ? error : { name: '', message: '' });
          setIsIdle();
        }
      },
    [setIsLoading, stacksNetwork, toast, setIsIdle, refreshAccountData]
  );
}
