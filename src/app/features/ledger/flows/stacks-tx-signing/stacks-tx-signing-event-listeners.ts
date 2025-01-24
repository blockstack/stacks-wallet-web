import type { StacksTransactionWire } from '@stacks/transactions';
import type { StacksTransaction } from '@stacks/transactions-v6';

import { GlobalAppEvents, appEvents } from '@app/common/publish-subscribe';

export async function listenForStacksTxLedgerSigningV6(
  unsignedTx: string
): Promise<StacksTransaction> {
  return new Promise((resolve, reject) => {
    function txSignedHandler(msg: GlobalAppEvents['ledgerStacksTxSignedV6']) {
      if (msg.unsignedTx === unsignedTx) {
        appEvents.unsubscribe('ledgerStacksTxSignedV6', txSignedHandler);
        appEvents.unsubscribe('ledgerStacksTxSigningCancelled', signingAbortedHandler);
        resolve(msg.signedTx);
      }
    }
    appEvents.subscribe('ledgerStacksTxSignedV6', txSignedHandler);

    function signingAbortedHandler(msg: GlobalAppEvents['ledgerStacksTxSigningCancelled']) {
      if (msg.unsignedTx === unsignedTx) {
        appEvents.unsubscribe('ledgerStacksTxSigningCancelled', signingAbortedHandler);
        appEvents.unsubscribe('ledgerStacksTxSignedV6', txSignedHandler);
        reject(new Error('User cancelled the signing operation'));
      }
    }
    appEvents.subscribe('ledgerStacksTxSigningCancelled', signingAbortedHandler);
  });
}

export async function listenForStacksTxLedgerSigning(
  unsignedTx: string
): Promise<StacksTransactionWire> {
  return new Promise((resolve, reject) => {
    function txSignedHandler(msg: GlobalAppEvents['ledgerStacksTxSigned']) {
      if (msg.unsignedTx === unsignedTx) {
        appEvents.unsubscribe('ledgerStacksTxSigned', txSignedHandler);
        appEvents.unsubscribe('ledgerStacksTxSigningCancelled', signingAbortedHandler);
        resolve(msg.signedTx);
      }
    }
    appEvents.subscribe('ledgerStacksTxSigned', txSignedHandler);

    function signingAbortedHandler(msg: GlobalAppEvents['ledgerStacksTxSigningCancelled']) {
      if (msg.unsignedTx === unsignedTx) {
        appEvents.unsubscribe('ledgerStacksTxSigningCancelled', signingAbortedHandler);
        appEvents.unsubscribe('ledgerStacksTxSigned', txSignedHandler);
        reject(new Error('User cancelled the signing operation'));
      }
    }
    appEvents.subscribe('ledgerStacksTxSigningCancelled', signingAbortedHandler);
  });
}
