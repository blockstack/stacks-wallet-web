import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@stacks/common';
import { ChainId } from '@stacks/network';
import { ClarityType, ClarityValue, cvToString, encodeStructuredData } from '@stacks/transactions';

import { stacksChainIdToCoreNetworkMode } from '@leather.io/stacks';

import { UnsignedMessageStructured } from '@shared/signature/signature-types';

import { capitalize } from '@app/common/utils';

export function cvToDisplay(cv: ClarityValue): string {
  return cvToString(cv).replaceAll('"', '');
}

export function chainIdToDisplay(chainIdCv: ClarityValue): string {
  if (chainIdCv.type !== ClarityType.UInt) return '';
  const chainIdString = cvToString(chainIdCv);
  const chainId = parseInt(chainIdString.replace('u', ''));
  if (!Object.values(ChainId).includes(chainId)) return '';
  return capitalize(stacksChainIdToCoreNetworkMode(chainId));
}

export function deriveStructuredMessageHash({
  domain,
  message,
}: Omit<UnsignedMessageStructured, 'messageType'>) {
  return bytesToHex(sha256(encodeStructuredData({ message, domain })));
}
