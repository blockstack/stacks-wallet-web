import { useEffect, useState } from 'react';
import { Outlet, Route, useLocation } from 'react-router-dom';

import * as btc from '@scure/btc-signer';
import { hexToBytes } from '@stacks/common';
import get from 'lodash.get';

import { RouteUrls } from '@shared/route-urls';

import { useScrollLock } from '@app/common/hooks/use-scroll-lock';
import { appEvents } from '@app/common/publish-subscribe';
import { delay } from '@app/common/utils';
import { BaseDrawer } from '@app/components/drawer/base-drawer';
import {
  LedgerTxSigningContext,
  LedgerTxSigningProvider,
} from '@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx.context';
import { useActionCancellableByUser } from '@app/features/ledger/utils/stacks-ledger-utils';
import { useSignLedgerBitcoinTx } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';

import { ConnectLedgerSignTx } from '../../generic-flows/tx-signing/steps/connect-ledger-sign-tx';
import {
  ConnectLedgerError,
  ConnectLedgerSuccess,
  DeviceBusy,
  LedgerDeviceInvalidPayload,
  LedgerDisconnected,
  LedgerPublicKeyMismatch,
  OperationRejected,
  UnsupportedBrowserLayout,
} from '../../generic-steps';
import { LedgerBroadcastError } from '../../generic-steps/broadcast-error/broadcast-error';
import { useLedgerAnalytics } from '../../hooks/use-ledger-analytics.hook';
import { useLedgerNavigate } from '../../hooks/use-ledger-navigate';
import { connectLedgerBitcoinApp, getBitcoinAppVersion } from '../../utils/bitcoin-ledger-utils';
import { useLedgerResponseState } from '../../utils/generic-ledger-utils';
import { ApproveBitcoinSignLedgerTx } from './steps/approve-bitcoin-sign-ledger-tx';

export const ledgerBitcoinTxSigningRoutes = (
  <Route element={<LedgerSignBitcoinTxContainer />}>
    {/* TODO: find way to refactor common routes */}
    <Route path={RouteUrls.ConnectLedger} element={<ConnectLedgerSignTx />} />
    <Route path={RouteUrls.DeviceBusy} element={<DeviceBusy />} />
    <Route path={RouteUrls.ConnectLedgerError} element={<ConnectLedgerError />} />
    <Route path={RouteUrls.LedgerUnsupportedBrowser} element={<UnsupportedBrowserLayout />} />
    <Route path={RouteUrls.ConnectLedgerSuccess} element={<ConnectLedgerSuccess />} />
    <Route path={RouteUrls.AwaitingDeviceUserAction} element={<ApproveBitcoinSignLedgerTx />} />
    <Route path={RouteUrls.LedgerDisconnected} element={<LedgerDisconnected />} />
    <Route path={RouteUrls.LedgerOperationRejected} element={<OperationRejected />} />
    <Route path={RouteUrls.LedgerPublicKeyMismatch} element={<LedgerPublicKeyMismatch />} />
    <Route path={RouteUrls.LedgerDevicePayloadInvalid} element={<LedgerDeviceInvalidPayload />} />
    <Route path={RouteUrls.LedgerBroadcastError} element={<LedgerBroadcastError />} />
  </Route>
);

export function LedgerSignBitcoinTxContainer() {
  const location = useLocation();
  const ledgerNavigate = useLedgerNavigate();
  const ledgerAnalytics = useLedgerAnalytics();
  useScrollLock(true);

  const canUserCancelAction = useActionCancellableByUser();
  const [unsignedTransactionRaw, setUnsignedTransactionRaw] = useState<null | string>(null);
  const [unsignedTransaction, setUnsignedTransaction] = useState<null | btc.Transaction>(null);
  const signLedger = useSignLedgerBitcoinTx();

  useEffect(() => {
    const tx = get(location.state, 'tx');
    if (tx) {
      setUnsignedTransactionRaw(tx);
      console.log({ tx, decoded: btc.Transaction.fromPSBT(hexToBytes(tx)) });
      setUnsignedTransaction(btc.Transaction.fromPSBT(hexToBytes(tx)));
    }
  }, [location.state]);

  useEffect(() => () => setUnsignedTransaction(null), []);

  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();

  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);

  const signTransaction = async () => {
    try {
      setAwaitingDeviceConnection(true);
      const bitcoinApp = await connectLedgerBitcoinApp();

      const versionInfo = await getBitcoinAppVersion(bitcoinApp);
      ledgerAnalytics.trackDeviceVersionInfo(versionInfo);
      setAwaitingDeviceConnection(false);

      setLatestDeviceResponse(versionInfo as any);

      ledgerNavigate.toDeviceBusyStep('Verifying public key on Ledger…');

      ledgerNavigate.toConnectionSuccessStep('bitcoin');
      await delay(1000);
      if (!unsignedTransaction) throw new Error('No unsigned tx');

      ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: false });

      const btcTx = await signLedger(bitcoinApp, unsignedTransaction.toPSBT());
      if (!btcTx || !unsignedTransactionRaw) throw new Error('No tx returned');
      ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: true });
      await delay(1000);
      appEvents.publish('ledgerBitcoinTxSigned', {
        signedPsbt: btcTx,
        unsignedPsbt: unsignedTransactionRaw,
      });
    } catch (e) {
      ledgerAnalytics.transactionSignedOnLedgerRejected();
      ledgerNavigate.toOperationRejectedStep();
    }
  };

  const allowUserToGoBack = get(location.state, 'goBack');

  const ledgerContextValue: LedgerTxSigningContext = {
    chain: 'bitcoin',
    transaction: unsignedTransaction,
    signTransaction,
    latestDeviceResponse,
    awaitingDeviceConnection,
  };

  return (
    <LedgerTxSigningProvider value={ledgerContextValue}>
      <BaseDrawer
        enableGoBack={allowUserToGoBack}
        isShowing
        isWaitingOnPerformedAction={awaitingDeviceConnection || canUserCancelAction}
        onClose={ledgerNavigate.cancelLedgerAction}
        pauseOnClickOutside
        waitingOnPerformedActionMessage="Ledger device in use"
      >
        <Outlet />
      </BaseDrawer>
    </LedgerTxSigningProvider>
  );
}
