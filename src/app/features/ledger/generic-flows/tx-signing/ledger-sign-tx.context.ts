import { createContext, useContext } from 'react';

import * as btc from '@scure/btc-signer';
import { StacksTransactionWire } from '@stacks/transactions';

import type { SupportedBlockchains } from '@leather.io/models';

import { createWaitableAction } from '@app/common/utils/create-waitable-action';

import { BaseLedgerOperationContext } from '../../utils/generic-ledger-utils';

export function createWaitForUserToSeeWarningScreen() {
  return createWaitableAction<'ignored-warning' | 'cancelled-operation'>();
}

interface BaseLedgerTxSigningContext extends BaseLedgerOperationContext {
  chain: SupportedBlockchains;
  signTransaction(): Promise<void> | void;
}

interface BitcoinLedgerSigningContext extends BaseLedgerTxSigningContext {
  chain: 'bitcoin';
  transaction: btc.Transaction | null;
}

interface StacksLedgerSigningContext extends BaseLedgerTxSigningContext {
  chain: 'stacks';
  transaction: StacksTransactionWire | null;
  hasUserSkippedBuggyAppWarning: ReturnType<typeof createWaitForUserToSeeWarningScreen>;
}

export type LedgerTxSigningContext = BitcoinLedgerSigningContext | StacksLedgerSigningContext;

const ledgerTxSigningContext = createContext<LedgerTxSigningContext | null>(null);

export function useLedgerTxSigningContext() {
  const context = useContext(ledgerTxSigningContext);
  if (!context) throw new Error('ledgerTxSigningContext is undefined');
  return context;
}

export const LedgerTxSigningProvider = ledgerTxSigningContext.Provider;
