import { useMemo } from 'react';
import { useAsync } from 'react-async-hook';

import { bytesToHex } from '@stacks/common';
import type { TransactionPayload } from '@stacks/connect';

import { RpcErrorCode } from '@leather.io/rpc';

import { logger } from '@shared/logger';
import { makeRpcErrorResponse, makeRpcSuccessResponse } from '@shared/rpc/rpc-methods';
import { closeWindow } from '@shared/utils';
import { getPayloadFromToken } from '@shared/utils/requests';

import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import {
  type GenerateUnsignedTransactionOptions,
  generateUnsignedTransaction,
} from '@app/common/transactions/stacks/generate-unsigned-txs';
import { getTxSenderAddress } from '@app/common/transactions/stacks/transaction.utils';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useSignStacksTransaction } from '@app/store/transactions/transaction.hooks';

function useRpcStxCallContractParams() {
  const { origin, tabId } = useDefaultRequestParams();
  const requestId = initialSearchParams.get('requestId');
  const request = initialSearchParams.get('request');

  if (!origin || !request || !requestId) throw new Error('Invalid params');

  return useMemo(
    () => ({
      origin,
      tabId: tabId ?? 0,
      request: getPayloadFromToken(request),
      requestId,
    }),
    [origin, tabId, request, requestId]
  );
}

function useUnsignedStacksTransactionFromRequest(request: TransactionPayload) {
  const account = useCurrentStacksAccount();

  const tx = useAsync(async () => {
    if (!account) return;

    const options: GenerateUnsignedTransactionOptions = {
      publicKey: account.stxPublicKey,
      txData: request,
      fee: request.fee ?? 0,
      nonce: request.nonce,
    };
    return generateUnsignedTransaction(options);
  }, [account]);

  return tx.result;
}

export function useRpcStxCallContract() {
  const { origin, request, requestId, tabId } = useRpcStxCallContractParams();
  const signStacksTx = useSignStacksTransaction();
  const stacksTransaction = useUnsignedStacksTransactionFromRequest(request);

  return {
    origin,
    txSender: stacksTransaction ? getTxSenderAddress(stacksTransaction) : '',
    stacksTransaction,
    async onSignStacksTransaction(fee: number, nonce: number) {
      if (!stacksTransaction) {
        return logger.error('No stacks transaction to sign');
      }

      stacksTransaction.setFee(fee);
      stacksTransaction.setNonce(nonce);

      const signedTransaction = await signStacksTx(stacksTransaction);
      if (!signedTransaction) {
        throw new Error('Error signing stacks transaction');
      }

      chrome.tabs.sendMessage(
        tabId,
        makeRpcSuccessResponse('stx_callContract', {
          id: requestId,
          result: {
            txid: '', // Broadcast transaction?
            transaction: bytesToHex(signedTransaction.serialize()),
          } as any, // Fix this
        })
      );
      closeWindow();
    },
    onCancel() {
      chrome.tabs.sendMessage(
        tabId,
        makeRpcErrorResponse('stx_callContract', {
          id: requestId,
          error: {
            message: 'User denied signing stacks transaction',
            code: RpcErrorCode.USER_REJECTION,
          },
        })
      );
    },
  };
}
