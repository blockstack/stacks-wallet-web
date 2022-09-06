import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LedgerError } from '@zondax/ledger-stacks';
import toast from 'react-hot-toast';

import {
  doesLedgerStacksAppVersionSupportJwtAuth,
  getAppVersion,
  isStacksLedgerAppClosed,
  prepareLedgerDeviceConnection,
  useActionCancellableByUser,
  useLedgerResponseState,
} from '@app/features/ledger/ledger-utils';
import { delay } from '@app/common/utils';
import { RouteUrls } from '@shared/route-urls';
import {
  LedgerRequestKeysContext,
  LedgerRequestKeysProvider,
} from '@app/features/ledger/flows/request-keys/ledger-request-keys.context';
import { logger } from '@shared/logger';
import { BaseDrawer } from '@app/components/drawer/base-drawer';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import { useTriggerLedgerDeviceRequestKeys } from './use-trigger-ledger-request-keys';
import { useLedgerAnalytics } from '@app/features/ledger/hooks/use-ledger-analytics.hook';
import { useScrollLock } from '@app/common/hooks/use-scroll-lock';
import { pullKeysFromLedgerDevice } from './request-keys.utils';

export function LedgerRequestKeysContainer() {
  const navigate = useNavigate();
  const ledgerNavigate = useLedgerNavigate();
  const ledgerAnalytics = useLedgerAnalytics();

  const canUserCancelAction = useActionCancellableByUser();

  useScrollLock(true);

  const { completeLedgerDeviceOnboarding, fireErrorMessageToast } =
    useTriggerLedgerDeviceRequestKeys();

  const [outdatedAppVersionWarning, setAppVersionOutdatedWarning] = useState(false);
  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();
  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);

  const pullPublicKeysFromDevice = async () => {
    const stacksApp = await prepareLedgerDeviceConnection({
      setLoadingState: setAwaitingDeviceConnection,
      onError() {
        ledgerNavigate.toErrorStep();
      },
    });

    const versionInfo = await getAppVersion(stacksApp);
    ledgerAnalytics.trackDeviceVersionInfo(versionInfo);
    setLatestDeviceResponse(versionInfo);

    if (versionInfo.deviceLocked) {
      setAwaitingDeviceConnection(false);
      return;
    }

    if (versionInfo.returnCode !== LedgerError.NoErrors) {
      if (!isStacksLedgerAppClosed(versionInfo)) toast.error(versionInfo.errorMessage);
      return;
    }

    if (doesLedgerStacksAppVersionSupportJwtAuth(versionInfo)) {
      setAppVersionOutdatedWarning(true);
      return;
    }

    try {
      ledgerNavigate.toConnectionSuccessStep();
      await delay(1250);

      const resp = await pullKeysFromLedgerDevice(stacksApp)({
        onRequestKey(index) {
          ledgerNavigate.toDeviceBusyStep(`Requesting STX addresses (${index + 1}…5)`);
        },
      });
      if (resp.status === 'failure') {
        fireErrorMessageToast(resp.errorMessage);
        ledgerNavigate.toErrorStep(resp.errorMessage);
        return;
      }
      ledgerNavigate.toDeviceBusyStep();
      completeLedgerDeviceOnboarding(resp.publicKeys, latestDeviceResponse!?.targetId);
      ledgerAnalytics.publicKeysPulledFromLedgerSuccessfully();

      navigate(RouteUrls.Home);
      await stacksApp.transport.close();
    } catch (e) {
      logger.info(e);

      ledgerNavigate.toErrorStep();
    }
  };

  const onCancelConnectLedger = () => navigate(RouteUrls.Onboarding);

  const ledgerContextValue: LedgerRequestKeysContext = {
    pullPublicKeysFromDevice,
    latestDeviceResponse,
    awaitingDeviceConnection,
    outdatedAppVersionWarning,
  };

  return (
    <LedgerRequestKeysProvider value={ledgerContextValue}>
      <BaseDrawer
        isShowing
        isWaitingOnPerformedAction={awaitingDeviceConnection || canUserCancelAction}
        onClose={onCancelConnectLedger}
        pauseOnClickOutside
        waitingOnPerformedActionMessage="Ledger device in use"
      >
        <Outlet />
      </BaseDrawer>
    </LedgerRequestKeysProvider>
  );
}
