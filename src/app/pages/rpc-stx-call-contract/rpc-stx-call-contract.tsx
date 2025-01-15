import { StacksHighFeeWarningContainer } from '@app/features/stacks-high-fee-warning/stacks-high-fee-warning-container';
import { StacksTransactionSigner } from '@app/features/stacks-transaction-request/stacks-transaction-signer';
import { useBreakOnNonCompliantEntity } from '@app/query/common/compliance-checker/compliance-checker.query';

import { useRpcStxCallContract } from './use-rpc-stx-call-contract';

export function RpcStxCallContract() {
  const { onSignStacksTransaction, onCancel, stacksTransaction, txSender } =
    useRpcStxCallContract();

  useBreakOnNonCompliantEntity(txSender);

  return (
    <StacksHighFeeWarningContainer>
      <StacksTransactionSigner
        onSignStacksTransaction={onSignStacksTransaction}
        onCancel={onCancel}
        isMultisig={false}
        stacksTransaction={stacksTransaction}
      />
    </StacksHighFeeWarningContainer>
  );
}
