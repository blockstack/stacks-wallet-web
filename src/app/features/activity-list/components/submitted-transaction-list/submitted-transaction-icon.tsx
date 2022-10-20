import { addressToString, PayloadType, StacksTransaction } from '@stacks/transactions';
import { BoxProps, DynamicColorCircle } from '@stacks/ui';

import { StxIcon } from '@app/components/icons/stx-icon';
import { StacksTx } from '@shared/models/transactions/stacks-transaction.model';
import { getTxSenderAddress } from '@app/common/transactions/stacks/transaction.utils';
import { TransactionTypeIcon } from '@app/components/transaction/transaction-type-icon';
import { TransactionIconWrapper } from '@app/components/transaction/transaction-icon-wrapper';

interface SubmittedTransactionIconProps extends BoxProps {
  transaction: StacksTransaction;
}
export function SubmittedTransactionIcon({ transaction, ...rest }: SubmittedTransactionIconProps) {
  switch (transaction.payload.payloadType) {
    case PayloadType.SmartContract:
      return (
        <DynamicColorCircle
          position="relative"
          string={`${getTxSenderAddress(transaction)}.${transaction.payload.contractName.content}`}
          backgroundSize="200%"
          size="36px"
          {...rest}
        >
          <TransactionTypeIcon
            transaction={
              {
                tx_type: 'smart_contract',
                tx_status: 'pending',
              } as StacksTx
            }
          />
        </DynamicColorCircle>
      );
    case PayloadType.ContractCall:
      return (
        <DynamicColorCircle
          position="relative"
          string={`${addressToString(transaction.payload.contractAddress)}.${
            transaction.payload.contractName.content
          }::${transaction.payload.functionName.content}`}
          backgroundSize="200%"
          size="36px"
          {...rest}
        >
          <TransactionTypeIcon
            transaction={
              {
                tx_type: 'contract_call',
                tx_status: 'pending',
              } as StacksTx
            }
          />
        </DynamicColorCircle>
      );
    case PayloadType.TokenTransfer:
      return (
        <TransactionIconWrapper
          icon={StxIcon}
          transaction={
            {
              tx_type: 'token_transfer',
              tx_status: 'pending',
            } as StacksTx
          }
          {...rest}
        />
      );
    default:
      return null;
  }
}
