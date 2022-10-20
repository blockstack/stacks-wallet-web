import { FiList, FiAlertOctagon } from 'react-icons/fi';
import { BoxProps, DynamicColorCircle } from '@stacks/ui';

import { StacksTx } from '@shared/models/transactions/stacks-transaction.model';
import { StxIcon } from '@app/components/icons/stx-icon';

import { TransactionTypeIcon } from '../transaction/transaction-type-icon';
import { TransactionIconWrapper } from '../transaction/transaction-icon-wrapper';

interface TransactionIconProps extends BoxProps {
  transaction: StacksTx;
}
export function StacksTransactionIcon({ transaction, ...rest }: TransactionIconProps) {
  switch (transaction.tx_type) {
    case 'coinbase':
      return <TransactionIconWrapper icon={FiList} transaction={transaction} {...rest} />;
    case 'smart_contract':
      return (
        <DynamicColorCircle
          position="relative"
          string={`${transaction.smart_contract.contract_id}`}
          backgroundSize="200%"
          size="36px"
          {...rest}
        >
          <TransactionTypeIcon transaction={transaction} />
        </DynamicColorCircle>
      );
    case 'contract_call':
      return (
        <DynamicColorCircle
          position="relative"
          string={`${transaction.contract_call.contract_id}::${transaction.contract_call.function_name}`}
          backgroundSize="200%"
          size="36px"
          {...rest}
        >
          <TransactionTypeIcon transaction={transaction} />
        </DynamicColorCircle>
      );
    case 'token_transfer':
      return <TransactionIconWrapper icon={StxIcon} transaction={transaction} {...rest} />;
    case 'poison_microblock':
      return <TransactionIconWrapper icon={FiAlertOctagon} transaction={transaction} {...rest} />;
    default:
      return null;
  }
}
