import { useContext } from 'react';

import GenericErrorImg from '@assets/images/generic-error.png';
import { Box, HStack, styled } from 'leather-styles/jsx';

import { useLoading } from '@app/common/hooks/use-loading';
import { delay } from '@app/common/utils';
import { LedgerTitle } from '@app/features/ledger/components/ledger-title';
import { LedgerWrapper } from '@app/features/ledger/components/ledger-wrapper';
import { LeatherButton } from '@app/ui/components/button';

import { ledgerTxSigningContext } from '../ledger-sign-tx.context';

export function ContractPrincipalBugWarning() {
  const { hasUserSkippedBuggyAppWarning } = useContext(ledgerTxSigningContext);
  const { isLoading, setIsLoading, setIsIdle } = useLoading('temp-spinner-deep-link');
  return (
    <LedgerWrapper>
      <Box mx="space.02">
        <img src={GenericErrorImg} width="106px" />
      </Box>
      <LedgerTitle mt="space.04">Stacks Ledger app is outdated</LedgerTitle>
      <styled.span mt="space.04" mx="space.02" textStyle="body.02">
        Some transactions are not compatible with outdated app versions. Update your app in{' '}
        <a href="ledgerlive://manager" style={{ textDecoration: 'underline' }}>
          Ledger Live
        </a>{' '}
        and try again.
      </styled.span>
      <HStack mb="space.05" mt="space.06">
        <styled.a
          aria-busy={isLoading}
          href="ledgerlive://manager"
          onClick={async () => {
            setIsLoading();
            await delay(300);
            setIsIdle();
          }}
        >
          Open Ledger Live ↗
        </styled.a>
        <LeatherButton
          onClick={() => hasUserSkippedBuggyAppWarning.done('ignored-warning')}
          variant="outline"
        >
          Continue anyway
        </LeatherButton>
      </HStack>
    </LedgerWrapper>
  );
}
