import { broadcastRawTransaction } from '@stacks/transactions';

import { logger } from '@shared/logger';

import { getErrorMessage } from '@app/common/get-error-message';
import { delay } from '@app/common/utils';
import { validateTxId } from '@app/common/validation/validate-tx-id';

async function simulateShortDelayToAvoidUndefinedTabId() {
  await delay(1000);
}

interface BroadcastTransactionOptions {
  txRaw: string;
  serialized: Uint8Array;
  isSponsored: boolean;
  attachment?: string;
  networkUrl: string;
}
export async function broadcastStacksTransaction(options: BroadcastTransactionOptions) {
  const { txRaw, serialized, isSponsored, attachment, networkUrl } = options;

  if (isSponsored) {
    await simulateShortDelayToAvoidUndefinedTabId();
    return { txRaw };
  }

  const response = await broadcastRawTransaction(
    serialized,
    `${networkUrl}/v2/transactions`,
    attachment ? Buffer.from(attachment, 'hex') : undefined
  );

  if ('error' in response) {
    logger.error(`Error broadcasting raw transaction`, response);
    const message = getErrorMessage(response.reason as any);
    throw new Error(`${message} - ${(response as any).error}`);
  } else if (!validateTxId(response.txid)) {
    logger.error(`Error broadcasting raw transaction`, response);
    throw new Error('Invalid txid for transaction');
  }

  logger.info('Transaction broadcast', response);

  return {
    txId: response.txid,
    txRaw,
  };
}
