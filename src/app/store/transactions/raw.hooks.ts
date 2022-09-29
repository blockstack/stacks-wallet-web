import { useMemo } from 'react';
import { useAsync } from 'react-async-hook';
import { useAtom } from 'jotai';
import { deserializeTransaction } from '@stacks/transactions';

import { rawTxIdState } from '@app/store/transactions/raw';
import { useStacksClient } from '@app/store/common/api-clients.hooks';

export function useRawTxIdState() {
  return useAtom(rawTxIdState);
}

const rawTxCache = new Map();

function useRawTxState() {
  const [txId] = useRawTxIdState();
  const { transactionsApi } = useStacksClient();

  return useAsync(async () => {
    if (!txId) return;
    const match = rawTxCache.get(txId);
    // No need to fetch again
    if (match) return match;
    return transactionsApi.getRawTransactionById({ txId }).then(result => {
      const rawTx = result.raw_tx;
      rawTxCache.set(txId, rawTx);
      return rawTx;
    });
  }, [transactionsApi, txId]).result;
}

export function useRawDeserializedTxState() {
  const rawTx = useRawTxState();
  return useMemo(() => {
    if (!rawTx) return;
    return deserializeTransaction(rawTx);
  }, [rawTx]);
}
