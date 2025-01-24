import { ChainId } from '@stacks/network';

import { UnsignedMessage } from '@shared/signature/signature-types';

import { NoFeesWarningRow } from '@app/components/no-fees-warning-row';
import { SignMessageActions } from '@app/features/message-signer/stacks-sign-message-action';

import { StructuredPayload } from '../stacks-message-signing';
import { StacksMessageSigningDisclaimer } from './message-signing-disclaimer';
import { StructuredDataBox } from './structured-data-box';

interface SignatureRequestStructuredDataContentProps {
  isLoading: boolean;
  onSignMessage(unsignedMessage: UnsignedMessage): Promise<void>;
  onCancelMessageSigning(): void;
  payload: StructuredPayload;
}
export function SignatureRequestStructuredDataContent({
  isLoading,
  onSignMessage,
  onCancelMessageSigning,
  payload,
}: SignatureRequestStructuredDataContentProps) {
  return (
    <>
      <StructuredDataBox message={payload.message} domain={payload.domain} />
      <NoFeesWarningRow chainId={payload.network?.chainId ?? ChainId.Testnet} />
      <SignMessageActions
        isLoading={isLoading}
        onSignMessageCancel={onCancelMessageSigning}
        onSignMessage={() =>
          onSignMessage({
            messageType: 'structured',
            message: payload.message,
            domain: payload.domain,
          })
        }
      />
      <hr />
      <StacksMessageSigningDisclaimer appName={payload.appName} />
    </>
  );
}
