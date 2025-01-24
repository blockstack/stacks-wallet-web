import { deserializeCV } from '@stacks/transactions';
import { TokenInterface, decodeToken } from 'jsontokens';

import { isString } from '@leather.io/utils';

import type { StructuredMessageDataDomain } from '@shared/signature/signature-types';
import type { CommonSignaturePayload, SignaturePayload } from '@shared/utils/legacy-requests';

export function getGenericSignaturePayloadFromToken(requestToken: string): CommonSignaturePayload {
  const token = decodeToken(requestToken);
  return token.payload as unknown as CommonSignaturePayload;
}

export function getSignaturePayloadFromToken(requestToken: string): SignaturePayload {
  const token = decodeToken(requestToken);
  return token.payload as unknown as SignaturePayload;
}

export function getStructuredDataPayloadFromToken(requestToken: string) {
  const token = decodeToken(requestToken);
  if (isString(token.payload)) throw new Error('Error decoding json token');

  const result = token.payload as unknown as TokenInterface & {
    message: string;
    domain: string;
  };

  return {
    ...(result as unknown as CommonSignaturePayload),
    message: deserializeCV(result.message),
    domain: deserializeCV(result.domain) as StructuredMessageDataDomain,
  };
}
