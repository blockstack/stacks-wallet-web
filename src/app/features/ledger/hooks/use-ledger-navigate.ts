import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { bytesToHex } from '@stacks/common';
import { ClarityValue, StacksTransaction } from '@stacks/transactions';
import { Psbt } from 'bitcoinjs-lib';

import { SupportedBlockchains } from '@shared/constants';
import { RouteUrls } from '@shared/route-urls';

import { immediatelyAttemptLedgerConnection } from './use-when-reattempt-ledger-connection';

export function useLedgerNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  return useMemo(
    () => ({
      toConnectStepAndTryAgain() {
        return navigate(`../${RouteUrls.ConnectLedger}`, {
          replace: true,
          state: { [immediatelyAttemptLedgerConnection]: true },
        });
      },

      toConnectAndSignStacksTransactionStep(transaction: StacksTransaction) {
        return navigate(RouteUrls.ConnectLedger, {
          replace: true,
          relative: 'path',
          state: { tx: bytesToHex(transaction.serialize()) },
        });
      },

      toConnectAndSignBitcoinTransactionStep(psbt: Psbt) {
        return navigate(RouteUrls.ConnectLedger, {
          replace: true,
          relative: 'path',
          state: { tx: psbt.toHex() },
        });
      },

      toConnectAndSignUtf8MessageStep(message: string) {
        return navigate(RouteUrls.ConnectLedger, {
          replace: true,
          state: { type: 'utf8', message },
        });
      },

      toConnectAndSignStructuredMessageStep(domain: ClarityValue, message: ClarityValue) {
        return navigate(RouteUrls.ConnectLedger, {
          replace: true,
          state: { type: 'structured', domain, message },
        });
      },

      toDeviceBusyStep(description?: string) {
        return navigate(RouteUrls.DeviceBusy, { replace: true, state: { description } });
      },

      toConnectionSuccessStep(chain: SupportedBlockchains) {
        return navigate(RouteUrls.ConnectLedgerSuccess, { replace: true, state: { chain } });
      },

      toErrorStep(errorMessage?: string) {
        return navigate(RouteUrls.ConnectLedgerError, {
          replace: true,
          state: { latestLedgerError: errorMessage },
        });
      },

      toAwaitingDeviceOperation({ hasApprovedOperation }: { hasApprovedOperation: boolean }) {
        return navigate(RouteUrls.AwaitingDeviceUserAction, {
          replace: true,
          state: { hasApprovedOperation },
        });
      },

      toPublicKeyMismatchStep() {
        return navigate(RouteUrls.LedgerPublicKeyMismatch, { replace: true });
      },

      toDevicePayloadInvalid() {
        return navigate(RouteUrls.LedgerDevicePayloadInvalid, { replace: true });
      },

      toOperationRejectedStep(description?: string) {
        return navigate(RouteUrls.LedgerOperationRejected, {
          replace: true,
          state: { description },
        });
      },

      toDeviceDisconnectStep() {
        return navigate(RouteUrls.LedgerDisconnected, { replace: true });
      },

      toBroadcastErrorStep(error: string) {
        return navigate(RouteUrls.LedgerBroadcastError, { replace: true, state: { error } });
      },

      cancelLedgerAction() {
        return navigate('..', { relative: 'path', replace: true, state: { ...location.state } });
      },

      cancelLedgerActionAndReturnHome() {
        return navigate(RouteUrls.Home);
      },
    }),

    [location.state, navigate]
  );
}
