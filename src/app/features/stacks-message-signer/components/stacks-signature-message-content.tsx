import { bytesToHex } from '@stacks/common';
import { hashMessage } from '@stacks/encryption';
import { ChainId } from '@stacks/network';

import { UnsignedMessage } from '@shared/signature/signature-types';

import { NoFeesWarningRow } from '@app/components/no-fees-warning-row';

import { MessagePreviewBox } from '../../../features/message-signer/message-preview-box';
import { SignMessageActions } from '../../../features/message-signer/stacks-sign-message-action';
import { Utf8Payload } from '../stacks-message-signing';
import { StacksMessageSigningDisclaimer } from './message-signing-disclaimer';

interface SignatureRequestMessageContentProps {
  isLoading: boolean;
  onSignMessage(unsignedMessage: UnsignedMessage): Promise<void>;
  onCancelMessageSigning(): void;
  payload: Utf8Payload;
}
export function StacksSignatureRequestMessageContent({
  isLoading,
  onSignMessage,
  onCancelMessageSigning,
  payload,
}: SignatureRequestMessageContentProps) {
  return (
    <>
      <MessagePreviewBox
        message={payload.message}
        hash={bytesToHex(hashMessage(payload.message))}
      />
      <NoFeesWarningRow chainId={payload.network?.chainId ?? ChainId.Testnet} />
      <SignMessageActions
        isLoading={isLoading}
        onSignMessageCancel={onCancelMessageSigning}
        onSignMessage={() => onSignMessage({ messageType: 'utf8', message: payload.message })}
      />
      <hr />
      <StacksMessageSigningDisclaimer appName={payload.appName} />
    </>
  );
}
