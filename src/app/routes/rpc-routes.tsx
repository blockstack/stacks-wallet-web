import { Suspense } from 'react';
import { Route } from 'react-router-dom';

import { RouteUrls } from '@shared/route-urls';

import { EditNonceSheet } from '@app/features/dialogs/edit-nonce-dialog/edit-nonce-dialog';
import { ledgerBitcoinTxSigningRoutes } from '@app/features/ledger/flows/bitcoin-tx-signing/ledger-bitcoin-sign-tx-container';
import { ledgerStacksMessageSigningRoutes } from '@app/features/ledger/flows/stacks-message-signing/ledger-stacks-sign-msg.routes';
import { ledgerStacksTxSigningRoutes } from '@app/features/ledger/flows/stacks-tx-signing/ledger-sign-stacks-tx-container';
import { RpcGetAddresses } from '@app/pages/rpc-get-addresses/rpc-get-addresses';
import { rpcSendTransferRoutes } from '@app/pages/rpc-send-transfer/rpc-send-transfer.routes';
import { RpcSignPsbt } from '@app/pages/rpc-sign-psbt/rpc-sign-psbt';
import { RpcSignPsbtSummary } from '@app/pages/rpc-sign-psbt/rpc-sign-psbt-summary';
import { RpcStacksMessageSigning } from '@app/pages/rpc-sign-stacks-message/rpc-sign-stacks-message';
import { RpcSignStacksTransaction } from '@app/pages/rpc-sign-stacks-transaction/rpc-sign-stacks-transaction';
import { RpcStxCallContract } from '@app/pages/rpc-stx-call-contract/rpc-stx-call-contract';
import { AccountGate } from '@app/routes/account-gate';

import { SuspenseLoadingSpinner } from './app-routes';

export const rpcRequestRoutes = (
  <>
    <Route
      path={RouteUrls.RpcGetAddresses}
      element={
        <AccountGate>
          <RpcGetAddresses />
        </AccountGate>
      }
    />

    {rpcSendTransferRoutes}

    <Route
      path={RouteUrls.RpcSignBip322Message}
      lazy={async () => {
        const { RpcSignBip322MessageRoute } = await import(
          '@app/pages/rpc-sign-bip322-message/rpc-sign-bip322-message'
        );
        return { Component: RpcSignBip322MessageRoute };
      }}
    >
      {ledgerBitcoinTxSigningRoutes}
    </Route>
    <Route
      path={RouteUrls.RpcSignPsbt}
      element={
        <AccountGate>
          <RpcSignPsbt />
        </AccountGate>
      }
    >
      {ledgerBitcoinTxSigningRoutes}
    </Route>
    <Route
      path={RouteUrls.RpcSignPsbtSummary}
      element={
        <AccountGate>
          <RpcSignPsbtSummary />
        </AccountGate>
      }
    />
    <Route
      path={RouteUrls.RpcStacksSignature}
      element={
        <AccountGate>
          <Suspense fallback={<SuspenseLoadingSpinner />}>
            <RpcStacksMessageSigning />
          </Suspense>
        </AccountGate>
      }
    >
      {ledgerStacksMessageSigningRoutes}
    </Route>

    <Route
      path={RouteUrls.RpcSignStacksTransaction}
      element={
        <AccountGate>
          <RpcSignStacksTransaction />
        </AccountGate>
      }
    >
      {ledgerStacksTxSigningRoutes}
      <Route path={RouteUrls.EditNonce} element={<EditNonceSheet />} />
    </Route>

    <Route
      path={RouteUrls.RpcStxCallContract}
      element={
        <AccountGate>
          <RpcStxCallContract />
        </AccountGate>
      }
    >
      {ledgerStacksTxSigningRoutes}
      <Route path={RouteUrls.EditNonce} element={<EditNonceSheet />} />
    </Route>
  </>
);
