import { StacksTransaction } from '@stacks/transactions';
import { Box, HStack, Stack } from 'leather-styles/jsx';

import { useExplorerLink } from '@app/common/hooks/use-explorer-link';
import { getTxSenderAddress } from '@app/common/transactions/stacks/transaction.utils';
import { usePressable } from '@app/components/item-hover';
import { Tooltip } from '@app/components/tooltip';
import { TransactionTitle } from '@app/components/transaction/transaction-title';
import { Caption } from '@app/ui/components/typography/caption';
import { Title } from '@app/ui/components/typography/title';

import { SubmittedTransactionIcon } from './submitted-transaction-icon';
import { getSubmittedTransactionDetails } from './submitted-transaction-list.utils';

interface SubmittedTransactionItemProps {
  transaction: StacksTransaction;
  txId: string;
}
export function SubmittedTransactionItem({ transaction, txId }: SubmittedTransactionItemProps) {
  const [component, bind] = usePressable(true);
  const { handleOpenTxLink } = useExplorerLink();

  if (!transaction) return null;

  const submittedTransactionDetails = getSubmittedTransactionDetails({
    payload: transaction.payload,
    senderAddress: getTxSenderAddress(transaction),
    txId,
  });

  if (!submittedTransactionDetails) return null;

  const { caption, title, value } = submittedTransactionDetails;

  return (
    <Box {...bind}>
      <HStack
        alignItems="center"
        onClick={() =>
          handleOpenTxLink({
            blockchain: 'stacks',
            suffix: `&submitted=true`,
            txId,
          })
        }
        position="relative"
        gap="space.04"
        zIndex={2}
      >
        <SubmittedTransactionIcon transaction={transaction} />
        <HStack alignItems="center" flexGrow={1} justifyContent="space-between">
          <Stack minWidth="0px" gap="space.03">
            <TransactionTitle title={title} />
            <Stack flexWrap="wrap">
              <Caption>{caption}</Caption>
              <Tooltip
                placement="bottom"
                label={'Transaction broadcasted, but not yet in the mempool'}
              >
                <Caption>Submitted</Caption>
              </Tooltip>
            </Stack>
          </Stack>
          <Box alignItems="flex-end">{value && <Title fontWeight="normal">{value}</Title>}</Box>
        </HStack>
      </HStack>
      {component}
    </Box>
  );
}
