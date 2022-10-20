import dayjs from 'dayjs';

import { displayDate, isoDateToLocalDateSafe, todaysIsoDate } from '@app/common/date-utils';
import {
  TransactionListBitcoinTx,
  TransactionListStacksTx,
  TransactionListTxs,
} from '@app/features/activity-list/components/transaction-list/transaction-list.model';
import { isUndefined } from '@shared/utils';
import { WalletBlockchains } from '@shared/models/blockchain.model';

export function getTransactionId(listTx: TransactionListTxs) {
  switch (listTx.blockchain) {
    case WalletBlockchains.bitcoin:
      return listTx.transaction.txid;
    case WalletBlockchains.stacks:
      return listTx.transaction.tx.tx_id;
    default:
      return undefined;
  }
}

function getTransactionTime(listTx: TransactionListTxs) {
  switch (listTx.blockchain) {
    case WalletBlockchains.bitcoin:
      if (!listTx.transaction.status.block_time) return;
      return dayjs.unix(listTx.transaction.status.block_time).format();
    case WalletBlockchains.stacks:
      return (
        listTx.transaction.tx.burn_block_time_iso ||
        listTx.transaction.tx.parent_burn_block_time_iso
      );
    default:
      return undefined;
  }
}

function groupTxsByDateMap(txs: TransactionListTxs[]) {
  return txs.reduce((txsByDate, tx) => {
    const time = getTransactionTime(tx);
    const date = time ? isoDateToLocalDateSafe(time) : undefined;

    if (isUndefined(date)) {
      const today = todaysIsoDate();
      txsByDate.set(today, [...(txsByDate.get(today) || []), tx]);
    } else {
      if (!txsByDate.has(date)) {
        txsByDate.set(date, []);
      }
      txsByDate.set(date, [...(txsByDate.get(date) || []), tx]);
    }
    return txsByDate;
  }, new Map<string, TransactionListTxs[]>());
}

function formatTxDateMapAsList(txMap: Map<string, TransactionListTxs[]>) {
  return [...txMap.keys()].map(date => ({
    date,
    displayDate: displayDate(date),
    txs: txMap.get(date) ?? [],
  }));
}

function countTxIds(txs: TransactionListStacksTx[]) {
  return txs.reduce((acc, stacksTx) => {
    return acc.set(
      stacksTx.transaction.tx.tx_id,
      (acc.get(stacksTx.transaction.tx.tx_id) || 0) + 1
    );
  }, new Map());
}

function filterDuplicateStacksTxs(txs: TransactionListStacksTx[]) {
  const countOfTxIds = countTxIds(txs);

  return txs.filter(stacksTx => {
    const isDropped = stacksTx.transaction.tx.tx_status.includes('dropped');
    if (countOfTxIds.get(stacksTx.transaction.tx.tx_id) === 1 && !isDropped) return true;
    return (
      stacksTx.transaction.tx.tx_status === 'success' ||
      stacksTx.transaction.tx.tx_status.includes('abort')
    );
  });
}

function sortGroupedTransactions(
  txs: {
    date: string;
    displayDate: string;
    txs: TransactionListTxs[];
  }[]
) {
  return txs.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
}

export function createTxDateFormatList(
  bitcoinTxs: TransactionListBitcoinTx[],
  stacksTxs: TransactionListStacksTx[]
) {
  const formattedTxs = formatTxDateMapAsList(
    groupTxsByDateMap([...bitcoinTxs, ...filterDuplicateStacksTxs(stacksTxs)])
  );
  return sortGroupedTransactions(formattedTxs);
}
