import type { PendingConfirmation } from '@app/common/monitor-confirmations/monitor-confirmations';

export async function monitorTransactions() {
  const alarm = await chrome.alarms.get('transaction-monitor');

  if (!alarm) {
    await chrome.alarms.create('transaction-monitor', {
      periodInMinutes: 0.05,
    });
  }
}

const MONITORED_TXNS_KEY = 'monitoredTransactions';

interface PendingConfirmationStore {
  pendingConfirmations: PendingConfirmation[];
}

export async function readTransactionStore() {
  const { pendingConfirmations = [] } = chrome.storage.local.get(
    MONITORED_TXNS_KEY
  ) as unknown as PendingConfirmationStore;

  return pendingConfirmations;
}

export async function writeTransaction(pendingConfirmation: PendingConfirmation) {
  const exisitingPendingConfirmations = await readTransactionStore();
  return await chrome.storage.local.set({
    [MONITORED_TXNS_KEY]: [pendingConfirmation, ...exisitingPendingConfirmations],
  });
}
