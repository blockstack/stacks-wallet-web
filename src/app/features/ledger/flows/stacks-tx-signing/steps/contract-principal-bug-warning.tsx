import { useContext } from 'react';

import GenericErrorImg from '@assets/images/generic-error.png';
import { Box, Button, Stack } from '@stacks/ui';
import { styled } from 'leather-styles/jsx';

import { useLoading } from '@app/common/hooks/use-loading';
import { delay } from '@app/common/utils';
import { LedgerTitle } from '@app/features/ledger/components/ledger-title';
import { LedgerWrapper } from '@app/features/ledger/components/ledger-wrapper';

import { ledgerTxSigningContext } from '../ledger-sign-tx.context';

export function ContractPrincipalBugWarning() {
  const { hasUserSkippedBuggyAppWarning } = useContext(ledgerTxSigningContext);
  const { isLoading, setIsLoading, setIsIdle } = useLoading('temp-spinner-deep-link');
  return (
    <LedgerWrapper>
      <Box mb="tight" mt="tight">
        <img src={GenericErrorImg} width="106px" />
      </Box>
      <LedgerTitle mt="base-loose">Stacks Ledger app is outdated</LedgerTitle>
      <styled.span mt="space.04" mx="space.02" textStyle="body.02">
        Some transactions are not compatible with outdated app versions. Update your app in{' '}
        <a href="ledgerlive://manager" style={{ textDecoration: 'underline' }}>
          Ledger Live
        </a>{' '}
        and try again.
      </styled.span>
      <Stack isInline mb="loose" mt="extra-loose">
        <Button
          as="a"
          href="ledgerlive://manager"
          isLoading={isLoading}
          onClick={async () => {
            setIsLoading();
            await delay(300);
            setIsIdle();
          }}
        >
          Open Ledger Live ↗
        </Button>
        <Button
          mode="tertiary"
          onClick={() => hasUserSkippedBuggyAppWarning.done('ignored-warning')}
        >
          Continue anyway
        </Button>
      </Stack>
    </LedgerWrapper>
  );
}
