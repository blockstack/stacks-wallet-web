import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthType, StacksTransactionWire } from '@stacks/transactions';

import type { CryptoCurrency } from '@leather.io/models';
import { delay, isError, isString } from '@leather.io/utils';

import { finalizeTxSignature } from '@shared/actions/finalize-tx-signature';
import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';

import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { LoadingKeys } from '@app/common/hooks/use-loading';
import { useSubmitTransactionCallback } from '@app/common/hooks/use-submit-stx-transaction';
import {
  StacksTransactionActionType,
  stacksTransactionToHex,
} from '@app/common/transactions/stacks/transaction.utils';
import { useToast } from '@app/features/toasts/use-toast';
import { useTransactionRequest } from '@app/store/transactions/requests.hooks';
import { useSignStacksTransaction } from '@app/store/transactions/transaction.hooks';

import { useStacksTransactionSummary } from './use-stacks-transaction-summary';

async function simulateShortDelayToAvoidUndefinedTabId() {
  await delay(1000);
}

interface UseStacksBroadcastTransactionArgs {
  token: CryptoCurrency;
  decimals?: number;
  actionType?: StacksTransactionActionType;
}

export function useStacksBroadcastTransaction({
  token,
  decimals,
  actionType,
}: UseStacksBroadcastTransactionArgs) {
  const signStacksTransaction = useSignStacksTransaction();
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const { tabId } = useDefaultRequestParams();
  const requestToken = useTransactionRequest();
  const { formSentSummaryTxState } = useStacksTransactionSummary(token);
  const navigate = useNavigate();
  const toast = useToast();

  const isIncreaseFeeTransaction = actionType === StacksTransactionActionType.IncreaseFee;
  const isCancelTransaction = actionType === StacksTransactionActionType.Cancel;

  const broadcastTransactionFn = useSubmitTransactionCallback({
    loadingKey: LoadingKeys.SUBMIT_SEND_FORM_TRANSACTION,
  });

  return useMemo(() => {
    function handlePreviewSuccess(signedTx: StacksTransactionWire, txId?: string) {
      if (requestToken && tabId) {
        finalizeTxSignature({
          requestPayload: requestToken,
          tabId,
          data: {
            txRaw: stacksTransactionToHex(signedTx),
            txId,
          },
        });
      }
      if (txId) {
        if (isIncreaseFeeTransaction || isCancelTransaction) {
          navigate(RouteUrls.Activity);
          return;
        }

        navigate(
          RouteUrls.SentStxTxSummary.replace(':symbol', token.toLowerCase()).replace(
            ':txId',
            `${txId}`
          ),
          formSentSummaryTxState(txId, signedTx, decimals)
        );
      }
    }

    async function broadcastTransactionAction(signedTx: StacksTransactionWire) {
      if (!signedTx) {
        logger.error('Cannot broadcast transaction, no tx in state');
        toast.error('Unable to broadcast transaction');
        return;
      }
      try {
        setIsBroadcasting(true);
        const isSponsored = signedTx.auth?.authType === AuthType.Sponsored;
        if (isSponsored) {
          await simulateShortDelayToAvoidUndefinedTabId();
          handlePreviewSuccess(signedTx);
        } else {
          await broadcastTransactionFn({
            onError(e: Error | string) {
              const message = isString(e) ? e : e.message;
              navigate(RouteUrls.TransactionBroadcastError, { state: { message } });
            },
            onSuccess(txId) {
              handlePreviewSuccess(signedTx, txId);
              if (isIncreaseFeeTransaction) {
                toast.success('Fee increased successfully');
              }
              if (isCancelTransaction) {
                toast.success('Transaction cancelled successfully');
              }
            },
            replaceByFee: false,
          })(signedTx);
        }
      } catch (e) {
        navigate(RouteUrls.TransactionBroadcastError, {
          state: { message: isError(e) ? e.message : 'Unknown error' },
        });
      } finally {
        setIsBroadcasting(false);
      }
    }

    async function broadcastTransaction(unsignedTx: StacksTransactionWire) {
      try {
        if (!unsignedTx) return;
        const signedTx = await signStacksTransaction(unsignedTx);
        // TODO: Maybe better error handling here?
        if (!signedTx) return;
        await broadcastTransactionAction(signedTx);
      } catch (e) {}
    }

    return {
      stacksBroadcastTransaction: broadcastTransaction,
      isBroadcasting,
    };
  }, [
    isBroadcasting,
    requestToken,
    tabId,
    navigate,
    token,
    formSentSummaryTxState,
    decimals,
    toast,
    broadcastTransactionFn,
    signStacksTransaction,
    isIncreaseFeeTransaction,
    isCancelTransaction,
  ]);
}
