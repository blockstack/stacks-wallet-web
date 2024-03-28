import { useFormikContext } from 'formik';

import { LoadingKeys, useLoading } from '@app/common/hooks/use-loading';
import { useWalletType } from '@app/common/use-wallet-type';
import { Button } from '@app/ui/components/button/button';

interface IncreaseFeeActionsProps {
  isDisabled: boolean;
  onCancel(): void;
}
export function IncreaseFeeActions(props: IncreaseFeeActionsProps) {
  const { onCancel, isDisabled } = props;

  const { handleSubmit } = useFormikContext();
  const { isLoading } = useLoading(LoadingKeys.INCREASE_FEE_DRAWER);
  const { whenWallet } = useWalletType();

  const actionText = whenWallet({ ledger: 'Confirm on Ledger', software: 'Submit' });

  return (
    <>
      <Button onClick={onCancel} variant="outline" flexGrow={1}>
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={handleSubmit as any}
        aria-busy={isLoading}
        borderRadius="sm"
        aria-disabled={isDisabled}
        flexGrow={1}
      >
        {actionText}
      </Button>
    </>
  );
}
