import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { HStack, styled } from 'leather-styles/jsx';

import { ChevronsRightIcon, CloseIcon, DropdownMenu } from '@leather.io/ui';

import { TransactionActionMenu } from '../transaction-item/transaction-action-menu';

interface StacksTransactionActionMenuProps {
  onIncreaseFee(): void;
  onCancelTransaction(): void;
}

export function StacksTransactionActionMenu({
  onIncreaseFee,
  onCancelTransaction,
}: StacksTransactionActionMenuProps) {
  return (
    <TransactionActionMenu>
      <DropdownMenu.Item
        data-testid={ActivitySelectors.ActivityItemMenuIncreaseFee}
        onClick={e => {
          e.stopPropagation();
          onIncreaseFee();
        }}
      >
        <HStack>
          <ChevronsRightIcon variant="small" />
          <styled.span textStyle="label.02">Increase fee</styled.span>
        </HStack>
      </DropdownMenu.Item>
      <DropdownMenu.Item
        data-testid={ActivitySelectors.ActivityItemMenuCancelTransaction}
        onClick={e => {
          e.stopPropagation();
          onCancelTransaction();
        }}
      >
        <HStack>
          <CloseIcon variant="small" />
          <styled.span textStyle="label.02">Cancel transaction</styled.span>
        </HStack>
      </DropdownMenu.Item>
    </TransactionActionMenu>
  );
}
