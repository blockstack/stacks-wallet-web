/* eslint-disable no-console */
import { z } from 'zod';

import { supportedBlockchains } from '@leather.io/models';

export const pendingConfirmationSchema = z.object({
  chain: z.enum(supportedBlockchains),
  txid: z.string(),
});

export type PendingConfirmation = z.infer<typeof pendingConfirmationSchema>;

const pendingConfirmationsAlarm = 'pending-confirmation-alarm';
const PENDING_CONFIRMATIONS_STORE = 'pendingConfirmations';

export async function monitorPendingConfirmations() {
  console.log('monitoring confirmations');
  const alarm = await chrome.alarms.get(pendingConfirmationsAlarm);

  if (!alarm) {
    console.log('starting pending confirmation alarm');
    await chrome.alarms.create(pendingConfirmationsAlarm, {
      periodInMinutes: 0.05,
    });
  }
}

interface PendingConfirmationStore {
  pendingConfirmations: PendingConfirmation[];
}

export async function readPendingConfirmationsStore() {
  const { pendingConfirmations = [] } = chrome.storage.local.get(
    PENDING_CONFIRMATIONS_STORE
  ) as unknown as PendingConfirmationStore;

  return pendingConfirmations;
}

export async function writeTransaction(pendingConfirmation: PendingConfirmation) {
  const exisitingPendingConfirmations = await readPendingConfirmationsStore();
  return await chrome.storage.local.set({
    [PENDING_CONFIRMATIONS_STORE]: [pendingConfirmation, ...exisitingPendingConfirmations],
  });
}
