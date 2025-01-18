import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { StacksTransactionWire } from '@stacks/transactions';

import { isError, isString } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';

import { LoadingKeys, useLoading } from '@app/common/hooks/use-loading';
import { useSubmitTransactionCallback } from '@app/common/hooks/use-submit-stx-transaction';
import { useToast } from '@app/features/toasts/use-toast';

export function useStacksBroadcastSwap() {
  const { setIsIdle } = useLoading(LoadingKeys.SUBMIT_SWAP_TRANSACTION);
  const navigate = useNavigate();
  const toast = useToast();

  const broadcastTransactionFn = useSubmitTransactionCallback({
    loadingKey: LoadingKeys.SUBMIT_SWAP_TRANSACTION,
  });

  return useCallback(
    async (signedTx: StacksTransactionWire) => {
      if (!signedTx) {
        logger.error('Cannot broadcast transaction, no tx in state');
        toast.error('Unable to broadcast transaction');
        return;
      }
      try {
        await broadcastTransactionFn({
          onError(e: Error | string) {
            setIsIdle();
            const message = isString(e) ? e : e.message;
            navigate(RouteUrls.TransactionBroadcastError, { state: { message } });
          },
          onSuccess() {
            toast.success('Transaction submitted!');
            setIsIdle();
            navigate(RouteUrls.Activity);
          },
          replaceByFee: false,
        })(signedTx);
      } catch (e) {
        setIsIdle();
        navigate(RouteUrls.TransactionBroadcastError, {
          state: { message: isError(e) ? e.message : 'Unknown error' },
        });
      } finally {
        setIsIdle();
      }
    },
    [toast, broadcastTransactionFn, setIsIdle, navigate]
  );
}
