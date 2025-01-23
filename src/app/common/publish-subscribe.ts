import type { Transaction } from '@scure/btc-signer';
import type { SignatureData } from '@stacks/connect';
import type { StacksTransactionWire } from '@stacks/transactions';
import type { StacksTransaction } from '@stacks/transactions-v6';

import type { UnsignedMessage } from '@shared/signature/signature-types';

type PubTypeFn<E> = <Key extends string & keyof E>(
  event: Key,
  // Ensures if we have an event with no payload, the second arg can be empty,
  // rather than `undefined`
  ...message: null extends E[Key] ? [data?: never] : [data: E[Key]]
) => void;

type SubTypeFn<E> = <Key extends string & keyof E>(
  event: Key,
  fn: (message: E[Key]) => void
) => void;

type MessageFn<E> = <Key extends string & keyof E>(message: E[Key]) => void;

interface PubSubType<E> {
  publish: PubTypeFn<E>;
  subscribe: SubTypeFn<E>;
  unsubscribe: SubTypeFn<E>;
}
function createPublishSubscribe<E>(): PubSubType<E> {
  const handlers: { [key: string]: MessageFn<any>[] } = {};

  return {
    publish(event, msg?) {
      handlers[event].forEach(h => h(msg));
    },

    subscribe(event, callback) {
      const list = handlers[event] ?? [];
      list.push(callback);
      handlers[event] = list;
    },

    unsubscribe(event, callback) {
      let list = handlers[event] ?? [];
      list = list.filter(h => h !== callback);
      handlers[event] = list;
    },
  };
}

// Global app events. Only add events if your feature isn't capable of
// communicating internally.
export interface GlobalAppEvents {
  ledgerStacksTxSignedV6: {
    unsignedTx: string;
    signedTx: StacksTransaction;
  };
  ledgerStacksTxSigned: {
    unsignedTx: string;
    signedTx: StacksTransactionWire;
  };
  ledgerStacksTxSigningCancelled: {
    unsignedTx: string;
  };
  ledgerBitcoinTxSigned: {
    unsignedPsbt: string;
    signedPsbt: Transaction;
  };
  ledgerBitcoinTxSigningCancelled: {
    unsignedPsbt: string;
  };
  ledgerStacksMessageSigned: {
    unsignedMessage: UnsignedMessage;
    messageSignatures: SignatureData;
  };
  ledgerStacksMessageSigningCancelled: {
    unsignedMessage: UnsignedMessage;
  };
  ledgerJwtMessageSigningComplete: unknown;
}

export const appEvents = createPublishSubscribe<GlobalAppEvents>();
