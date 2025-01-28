import { useContext } from 'react';

import { logger } from '@shared/logger';
import { whenSignableMessageOfType } from '@shared/signature/signature-types';

import { ApproveLedgerOperationLayout } from '../../../generic-steps';
import { useHasApprovedOperation } from '../../../hooks/use-has-approved-transaction';
import { ledgerMsgSigningContext } from '../ledger-stacks-sign-msg.context';
import { cvToDisplay, deriveStructuredMessageHash } from '../message-signing.utils';

export function SignLedgerMessage() {
  const { message } = useContext(ledgerMsgSigningContext);
  const hasApprovedOperation = useHasApprovedOperation();

  if (!message) {
    logger.error(`${SignLedgerMessage.name} must not render without a "message" defined`);
    return null;
  }

  return whenSignableMessageOfType(message)({
    utf8: msg => (
      <ApproveLedgerOperationLayout
        description="Sign message on your Ledger"
        details={[['Message', msg]]}
        status={hasApprovedOperation ? 'approved' : 'awaiting-approval'}
      />
    ),
    structured: (domain, message) => {
      const ledgerFirstHashPageInView = 34;
      const hash = deriveStructuredMessageHash({ domain, message });
      const [hashPart1, hashPart2] = [
        hash.slice(0, ledgerFirstHashPageInView),
        hash.slice(ledgerFirstHashPageInView),
      ];
      return (
        <ApproveLedgerOperationLayout
          description="Sign structured data on your Ledger"
          details={[
            ['Chain ID', cvToDisplay(domain.value['chain-id'])],
            ['Name', cvToDisplay(domain.value.name)],
            ['Version', cvToDisplay(domain.value.version)],
            ['Message hash [1/2]', hashPart1],
            ['Message hash [2/2]', hashPart2],
          ]}
          status={hasApprovedOperation ? 'approved' : 'awaiting-approval'}
        />
      );
    },
  });
}
