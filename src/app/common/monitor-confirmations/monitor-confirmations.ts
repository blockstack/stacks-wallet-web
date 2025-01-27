import type { SupportedBlockchains } from '@leather.io/models';

const monitoredTxs: MonitoredConfirmation[] = [];

export interface MonitoredConfirmation {
  chain: SupportedBlockchains;
  txid: string;
}

function monitorConfirmation(txid: string) {}
