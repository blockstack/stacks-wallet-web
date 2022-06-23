import { SignatureData } from '@stacks/connect';
import { hashMessage } from '@stacks/encryption';
import {
  ClarityValue,
  getPublicKey,
  publicKeyToString,
  signMessageHashRsv,
  signStructuredData,
  StacksPrivateKey,
} from '@stacks/transactions';

export function signMessage(message: string, privateKey: StacksPrivateKey): SignatureData {
  const hash = hashMessage(message);
  return {
    signature: signMessageHashRsv({ privateKey, messageHash: hash.toString('hex') }).data,
    publicKey: publicKeyToString(getPublicKey(privateKey)),
  };
}

export function signStructuredDataMessage(
  message: ClarityValue,
  domain: ClarityValue,
  privateKey: StacksPrivateKey
): SignatureData {
  const signature = signStructuredData({
    message,
    domain,
    privateKey,
  }).data;

  return {
    signature,
    publicKey: publicKeyToString(getPublicKey(privateKey)),
  };
}
