import { BitcoinTx } from '@shared/models/transactions/bitcoin-transaction.model';

import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';
import { Caption } from '@app/ui/components/typography/caption';

interface BitcoinTransactionStatusProps {
  transaction: BitcoinTx;
}
const pendingWaitingMessage =
  'This transaction is waiting to be confirmed. The average (median) confirmation time on Bitcoin is 5-10 minutes';

export function BitcoinTransactionStatus({ transaction }: BitcoinTransactionStatusProps) {
  const isPending = !transaction.status.confirmed;
  return isPending ? (
    <BasicTooltip asChild label={pendingWaitingMessage} side="bottom">
      <Caption color="yellow.action-primary-default">Pending</Caption>
    </BasicTooltip>
  ) : null;
}
