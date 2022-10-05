import { useQuery } from '@tanstack/react-query';
import { MempoolTransaction } from '@stacks/stacks-blockchain-api-types';

import { useStacksClient } from '@app/store/common/api-clients.hooks';
import { safelyFormatHexTxid } from '@app/common/utils/safe-handle-txid';
import { useSubmittedTransactionsActions } from '@app/store/submitted-transactions/submitted-transactions.hooks';
import { useSubmittedTransactions } from '@app/store/submitted-transactions/submitted-transactions.selectors';

export function useAccountMempool(address: string) {
  const client = useStacksClient();
  const submittedTransactions = useSubmittedTransactions();
  const submittedTransactionsActions = useSubmittedTransactionsActions();

  function accountMempoolFetcher() {
    return client.transactionsApi.getAddressMempoolTransactions({ address, limit: 50 });
  }

  return useQuery({
    enabled: !!address,
    queryKey: ['account-mempool', address],
    queryFn: accountMempoolFetcher,
    onSuccess: data => {
      const pendingTxids = (data.results as MempoolTransaction[]).map(tx => tx.tx_id);
      submittedTransactions.map(tx => {
        if (pendingTxids.includes(safelyFormatHexTxid(tx.txId)))
          return submittedTransactionsActions.transactionEnteredMempool(tx.txId);
        return;
      });
    },
  });
}
