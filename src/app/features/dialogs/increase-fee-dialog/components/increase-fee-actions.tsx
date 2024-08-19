import { useFormikContext } from 'formik';

import { Button } from '@leather.io/ui';

import { useWalletType } from '@app/common/use-wallet-type';
import { ButtonRow } from '@app/components/layout';

interface IncreaseFeeActionsProps {
  isBroadcasting?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  onCancel(): void;
}
export function IncreaseFeeActions(props: IncreaseFeeActionsProps) {
  const { isBroadcasting, isDisabled, isLoading, onCancel } = props;

  const { handleSubmit } = useFormikContext();
  const { whenWallet } = useWalletType();

  const actionText = whenWallet({ ledger: 'Confirm on Ledger', software: 'Submit' });

  return (
    <ButtonRow flexDirection="row">
      <Button onClick={onCancel} variant="outline" flexGrow={1}>
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={handleSubmit as any}
        aria-busy={isLoading || isBroadcasting}
        borderRadius="sm"
        aria-disabled={isDisabled}
        disabled={isDisabled}
        flexGrow={1}
      >
        {actionText}
      </Button>
    </ButtonRow>
  );
}
