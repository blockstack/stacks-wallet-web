import { createContext } from 'react';

import { noop } from '@shared/utils';
import { BaseLedgerOperationContext } from '../../ledger-utils';

export interface LedgerJwtSigningContext extends BaseLedgerOperationContext {
  signJwtPayload(): Promise<void> | void;
  jwtPayloadHash: null | string;
}

export const ledgerJwtSigningContext = createContext<LedgerJwtSigningContext>({
  latestDeviceResponse: null,
  awaitingDeviceConnection: false,
  signJwtPayload: noop,
  jwtPayloadHash: null,
});

export const LedgerJwtSigningProvider = ledgerJwtSigningContext.Provider;
