import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import { LedgerOperationRejectedLayout } from '@app/features/ledger/generic-steps/operation-rejected/operation-rejected.layout';
import { useLocationState } from '@app/common/hooks/use-location-state';

export function OperationRejected() {
  const ledgerNavigate = useLedgerNavigate();
  const description = useLocationState('description', 'The operation on device was rejected');
  return (
    <LedgerOperationRejectedLayout
      description={description}
      onClose={() => ledgerNavigate.cancelLedgerAction()}
    />
  );
}
