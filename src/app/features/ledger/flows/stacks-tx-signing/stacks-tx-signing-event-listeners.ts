import type { StacksTransactionWire } from '@stacks/transactions';

import { GlobalAppEvents, appEvents } from '@app/common/publish-subscribe';

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
