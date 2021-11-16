import { statusFromTx } from '@common/api/transactions';
import { isAddressTransactionWithTransfers } from '@common/transactions/transaction-utils';
import { useCurrentAccount } from '@store/accounts/account.hooks';
import {
  AddressTransactionWithTransfers,
  MempoolTransaction,
} from '@stacks/stacks-blockchain-api-types';
import dayjs from 'dayjs';
import { useAnalytics } from './use-analytics';
import { StacksTransaction } from '@stacks/transactions';

let previousAccountTransactions: Map<string, TxStatus>;

function changedTransactions(previousTxs: Map<string, TxStatus>, txs: Map<string, TxStatus>) {
  if (!previousTxs) return;
  const result = new Map(
    [...txs]
      .filter(
        ([key, value]) =>
          (!previousTxs.get(key) && value.status === 'submitted') ||
          (previousTxs.get(key) && previousTxs.get(key)?.status !== value.status)
      )
      .map(([key, value]) => {
        const timeSinceLastState =
          previousTxs.get(key) && dayjs(value.timeIso).diff(previousTxs.get(key)?.timeIso);
        return [
          key,
          { ...value, previous_state: previousTxs.get(key)?.status, timeSinceLastState },
        ];
      })
  );
  return result;
}

interface TxStatus {
  timeIso: string;
  broadcastTimeIso: string;
  status: string;
  type: 'inbound' | 'outbound';
  timeSinceBroadcast: number;
  tx: AddressTransactionWithTransfers | MempoolTransaction | StacksTransaction;
}

type localTx = {
  [key: string]: {
    transaction: StacksTransaction;
    timestamp: number;
  };
};

export function useTrackChangedTransactions(
  transactions: (AddressTransactionWithTransfers | MempoolTransaction)[],
  localTransactions: localTx
) {
  const currentAccount = useCurrentAccount();
  const analytics = useAnalytics();
  const now = new Date().toISOString();

  const result = new Map(previousAccountTransactions);
  Object.keys(localTransactions).forEach(key => {
    const tx = localTransactions[key];
    const status = 'submitted';
    result.set(key, {
      timeIso: now,
      broadcastTimeIso: now,
      timeSinceBroadcast: 0,
      status,
      type: 'outbound',
      tx: tx.transaction,
    });
  });

  transactions.forEach(atx => {
    let time, tx;
    let type: 'inbound' | 'outbound';
    if (isAddressTransactionWithTransfers(atx)) {
      tx = atx.tx;
      type = tx.sender_address === currentAccount?.address ? 'outbound' : 'inbound';
      time = ('burn_block_time_iso' in tx && tx.burn_block_time_iso) || now;
    } else {
      tx = atx;
      type = 'outbound';
      time = ('receipt_time_iso' in tx && tx.receipt_time_iso) || now;
    }

    const status = statusFromTx(tx);
    if (status === 'success_microblock') {
      time = now; // since there is no real timestamp for microblocks, we just use the current time
    }
    const broadcastTimeIso = `${
      previousAccountTransactions?.get(tx.tx_id)?.broadcastTimeIso || now
    }`;
    const timeSinceBroadcast = dayjs(time).diff(broadcastTimeIso);
    result.set(tx.tx_id, {
      type,
      timeIso: time.toString(),
      status,
      tx: atx,
      broadcastTimeIso,
      timeSinceBroadcast,
    });
  });

  const changed = changedTransactions(previousAccountTransactions, result);

  previousAccountTransactions = result;
  if (!changed) return result;

  [...changed].forEach(([_, value]) =>
    analytics.track('change_transaction_state', { ...value, tx: undefined })
  );
  return result;
}
