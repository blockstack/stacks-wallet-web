import type { SupportedBlockchains } from '@leather.io/models';

const monitoredTxs: PendingConfirmation[] = [];

export interface PendingConfirmation {
  chain: SupportedBlockchains;
  txid: string;
}

function monitorConfirmation(txid: string) {}
