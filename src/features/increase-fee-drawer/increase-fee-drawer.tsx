import { Suspense, useEffect } from 'react';
import { Flex, Spinner, Stack } from '@stacks/ui';

import { LoadingKeys, useLoading } from '@common/hooks/use-loading';
import { ControlledDrawer } from '@components/drawer/controlled';
import { Caption } from '@components/typography';
import { useRawTxIdState } from '@store/transactions/raw.hooks';

import { IncreaseFeeForm } from './components/increase-fee-form';

export function IncreaseFeeDrawer(): JSX.Element {
  const [rawTxId, setRawTxId] = useRawTxIdState();
  const { isLoading, setIsIdle } = useLoading(LoadingKeys.INCREASE_FEE_DRAWER);

  useEffect(() => {
    if (isLoading && !rawTxId) {
      setIsIdle();
    }
  }, [isLoading, rawTxId, setIsIdle]);

  return (
    <ControlledDrawer
      title="Increase transaction fee"
      isShowing={!!rawTxId}
      onClose={() => setRawTxId(null)}
    >
      <Stack px="loose" spacing="loose" pb="extra-loose">
        {rawTxId ? (
          <Suspense
            fallback={
              <Flex alignItems="center" justifyContent="center" p="extra-loose">
                <Spinner />
              </Flex>
            }
          >
            <Caption>
              If your transaction has been pending for a long time, its fee might not be high enough
              to be included in a block. Increase the fee and try again.
            </Caption>
            <IncreaseFeeForm />
          </Suspense>
        ) : null}
      </Stack>
    </ControlledDrawer>
  );
}
