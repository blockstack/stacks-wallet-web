import {
  ClarityValue,
  StringAsciiCV,
  TupleCV,
  UIntCV,
  deserializeCV,
  serializeCVBytes,
} from '@stacks/transactions';

export type SignedMessageType = 'utf8' | 'structured';

export type StructuredMessageDataDomain = TupleCV<{
  name: StringAsciiCV;
  version: StringAsciiCV;
  'chain-id': UIntCV;
}>;

interface AbstractUnsignedMessage {
  messageType: SignedMessageType;
}

interface UnsignedMessageUtf8 extends AbstractUnsignedMessage {
  messageType: 'utf8';
  message: string;
}

export interface UnsignedMessageStructured extends AbstractUnsignedMessage {
  messageType: 'structured';
  message: ClarityValue;
  domain: StructuredMessageDataDomain;
}

interface SerializedUnsignedMessageStructured extends AbstractUnsignedMessage {
  messageType: 'structured';
  message: Uint8Array;
  domain: Uint8Array;
}

export type UnsignedMessage = UnsignedMessageUtf8 | UnsignedMessageStructured;

export function isStructuredMessageType(
  messageType: SignedMessageType
): messageType is 'structured' {
  return messageType === 'structured';
}

export function isUtf8MessageType(messageType: SignedMessageType): messageType is 'utf8' {
  return messageType === 'utf8';
}

export function isSignableMessageType(messageType: unknown): messageType is SignedMessageType {
  return typeof messageType === 'string' && ['utf8', 'structured'].includes(messageType);
}

interface WhenSignableMessageOfType<T> {
  utf8(message: string): T;
  structured(domain: StructuredMessageDataDomain, message: ClarityValue): T;
}
export function whenSignableMessageOfType(msg: UnsignedMessage) {
  return <T>({ utf8, structured }: WhenSignableMessageOfType<T>) => {
    if (msg.messageType === 'utf8') return utf8(msg.message);
    return structured(msg.domain, msg.message);
  };
}

export function toSerializableUnsignedMessage(
  unsignedMessage: UnsignedMessage
): UnsignedMessageUtf8 | SerializedUnsignedMessageStructured {
  if (unsignedMessage.messageType === 'utf8') return unsignedMessage;
  return {
    messageType: 'structured',
    message: serializeCVBytes(unsignedMessage.message),
    domain: serializeCVBytes(unsignedMessage.domain),
  };
}

export function deserializeUnsignedMessage(
  serializedUnsignedMessage: UnsignedMessageUtf8 | SerializedUnsignedMessageStructured
): UnsignedMessage {
  if (serializedUnsignedMessage.messageType === 'utf8') return serializedUnsignedMessage;
  return {
    messageType: 'structured',
    message: deserializeCV(serializedUnsignedMessage.message),
    domain: deserializeCV(serializedUnsignedMessage.domain),
  };
}
