import { MempoolTransaction } from '@stacks/stacks-blockchain-api-types';

import type { BitcoinTx } from '@leather.io/models';

import { BitcoinTransactionItem } from '@app/components/bitcoin-transaction-item/bitcoin-transaction-item';
import { SBtcDepositTransactionItem } from '@app/components/sbtc-deposit-status-item/sbtc-deposit-status-item';
import { StacksTransactionItem } from '@app/components/stacks-transaction-item/stacks-transaction-item';
import type { SBtcDepositInfo } from '@app/query/sbtc/sbtc-deposits.query';

import { PendingTransactionListLayout } from './pending-transaction-list.layout';

interface PendingTransactionListProps {
  bitcoinTxs: BitcoinTx[];
  sBtcDeposits: SBtcDepositInfo[];
  stacksTxs: MempoolTransaction[];
}
export function PendingTransactionList({
  bitcoinTxs,
  sBtcDeposits,
  stacksTxs,
}: PendingTransactionListProps) {
  return (
    <PendingTransactionListLayout>
      {bitcoinTxs.map(tx => (
        <BitcoinTransactionItem key={tx.txid} transaction={tx} />
      ))}
      {sBtcDeposits.map(deposit => (
        <SBtcDepositTransactionItem key={deposit.bitcoinTxid} deposit={deposit} />
      ))}
      {stacksTxs.map(tx => (
        <StacksTransactionItem key={tx.tx_id} transaction={tx} />
      ))}
    </PendingTransactionListLayout>
  );
}
