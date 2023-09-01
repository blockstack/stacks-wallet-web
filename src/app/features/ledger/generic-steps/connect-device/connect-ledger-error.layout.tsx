import { FiCircle } from 'react-icons/fi';

import ConnectLedgerError from '@assets/images/ledger/connect-ledger-error.png';
import { Box, Flex, Stack, color } from '@stacks/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { LeatherButton } from '@app/components/button/button';
import { ErrorLabel } from '@app/components/error-label';
import { Link } from '@app/components/link';
import { Caption } from '@app/components/typography';
import { WarningLabel } from '@app/components/warning-label';

import { LedgerTitle } from '../../components/ledger-title';
import { LedgerWrapper } from '../../components/ledger-wrapper';

interface PossibleReasonUnableToConnectProps {
  text: string;
}
function PossibleReasonUnableToConnect(props: PossibleReasonUnableToConnectProps) {
  const { text } = props;

  return (
    <Flex>
      <Box mr="tight" mt="3px">
        <FiCircle fill={color('text-caption')} size="4px" />
      </Box>
      <Caption>{text}</Caption>
    </Flex>
  );
}

interface ConnectLedgerErrorLayoutProps {
  warningText: string | null;
  onCancelConnectLedger(): void;
  onTryAgain(): void;
}
export function ConnectLedgerErrorLayout(props: ConnectLedgerErrorLayoutProps) {
  const { warningText, onTryAgain } = props;

  return (
    <LedgerWrapper>
      <Box mt="tight">
        <img src={ConnectLedgerError} width="247px" />
      </Box>
      <LedgerTitle mt="45px" mx="50px">
        We're unable to connect to your Ledger device
      </LedgerTitle>
      {warningText ? (
        <WarningLabel mt="base" px="extra-loose" fontSize="14px">
          {warningText}
        </WarningLabel>
      ) : (
        <ErrorLabel fontSize={1} lineHeight={1.4} mt="base">
          Unable to connect
        </ErrorLabel>
      )}
      <Stack
        border="2px solid"
        borderColor={color('border')}
        borderRadius="12px"
        my="loose"
        mx="base"
        spacing="base"
        textAlign="left"
        p="extra-loose"
      >
        <PossibleReasonUnableToConnect text="Check if Ledger Live is open. Close it and try again" />
        <PossibleReasonUnableToConnect text="Ensure you only have one instance of Leather open" />
        <PossibleReasonUnableToConnect text="Verify the Stacks app is installed and open" />
        <PossibleReasonUnableToConnect text="Check you've approved the browser USB pop up" />
      </Stack>
      <LeatherButton onClick={onTryAgain}>Try again</LeatherButton>
      <Caption mt="loose">
        If the problem persists, check our{' '}
        <Link
          display="inline"
          fontSize={1}
          onClick={() =>
            openInNewTab(
              'https://leather.gitbook.io/guides/securing-the-wallet/using-ledger-with-leather'
            )
          }
        >
          Support Page
        </Link>
      </Caption>
    </LedgerWrapper>
  );
}
