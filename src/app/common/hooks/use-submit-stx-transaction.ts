import { useCallback } from 'react';

import { StacksTransactionWire, broadcastTransaction } from '@stacks/transactions';

import { delay, isError } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { analytics } from '@shared/utils/analytics';

import { getErrorMessage } from '@app/common/get-error-message';
import { useRefreshAllAccountData } from '@app/common/hooks/account/use-refresh-all-account-data';
import { useLoading } from '@app/common/hooks/use-loading';
import { safelyFormatHexTxid } from '@app/common/utils/safe-handle-txid';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';

const timeForApiToUpdate = 250;

interface UseSubmitTransactionArgs {
  loadingKey: string;
}
interface UseSubmitTransactionCallbackArgs {
  replaceByFee?: boolean;
  onSuccess(txId: string): void;
  onError(error: Error | string): void;
}
export function useSubmitTransactionCallback({ loadingKey }: UseSubmitTransactionArgs) {
  const toast = useToast();
  const refreshAccountData = useRefreshAllAccountData();

  const { setIsLoading, setIsIdle } = useLoading(loadingKey);
  const stacksNetwork = useCurrentStacksNetworkState();

  return useCallback(
    ({ onSuccess, onError }: UseSubmitTransactionCallbackArgs) =>
      async (transaction: StacksTransactionWire) => {
        setIsLoading();
        try {
          const response = await broadcastTransaction({ transaction, network: stacksNetwork });
          if ('error' in response) {
            logger.error('Transaction broadcast', response);
            if (response.reason) toast.error(getErrorMessage(response.reason));
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
