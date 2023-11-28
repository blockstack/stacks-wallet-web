import { Suspense } from 'react';
import { Route } from 'react-router-dom';

import { RouteUrls } from '@shared/route-urls';

import { BroadcastErrorDrawer } from '@app/components/broadcast-error-drawer/broadcast-error-drawer';
import { EditNonceDrawer } from '@app/features/edit-nonce-drawer/edit-nonce-drawer';
import { ledgerStacksMessageSigningRoutes } from '@app/features/ledger/flows/stacks-message-signing/ledger-stacks-sign-msg.routes';
import { ledgerStacksTxSigningRoutes } from '@app/features/ledger/flows/stacks-tx-signing/ledger-sign-stacks-tx-container';
import { PsbtRequest } from '@app/pages/psbt-request/psbt-request';
import { StacksMessageSigningRequest } from '@app/pages/stacks-message-signing-request/stacks-message-signing-request';
import { TransactionRequest } from '@app/pages/transaction-request/transaction-request';
import { ProfileUpdateRequest } from '@app/pages/update-profile-request/update-profile-request';
import { AccountGate } from '@app/routes/account-gate';
import { SuspenseLoadingSpinner } from '@app/routes/app-routes';

export const legacyRequestRoutes = (
  <>
    <Route
      path={RouteUrls.TransactionRequest}
      element={
        <AccountGate>
          <Suspense fallback={<SuspenseLoadingSpinner />}>
            <TransactionRequest />
          </Suspense>
        </AccountGate>
      }
    >
      {ledgerStacksTxSigningRoutes}
      <Route path={RouteUrls.EditNonce} element={<EditNonceDrawer />} />
      <Route path={RouteUrls.TransactionBroadcastError} element={<BroadcastErrorDrawer />} />
    </Route>
    <Route
      path={RouteUrls.SignatureRequest}
      element={
        <AccountGate>
          <Suspense fallback={<SuspenseLoadingSpinner />}>
            <StacksMessageSigningRequest />
          </Suspense>
        </AccountGate>
      }
    >
      {ledgerStacksMessageSigningRoutes}
    </Route>
    <Route
      path={RouteUrls.ProfileUpdateRequest}
      element={
        <AccountGate>
          <Suspense fallback={<SuspenseLoadingSpinner />}>
            <ProfileUpdateRequest />
          </Suspense>
        </AccountGate>
      }
    />
    <Route
      path={RouteUrls.PsbtRequest}
      element={
        <AccountGate>
          <Suspense fallback={<SuspenseLoadingSpinner />}>
            <PsbtRequest />
          </Suspense>
        </AccountGate>
      }
    />
  </>
);
