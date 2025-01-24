import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { getAddressFromPublicKey } from '@stacks/transactions';
import { LedgerError } from '@zondax/ledger-stacks';
import get from 'lodash.get';

import { Sheet, SheetHeader } from '@leather.io/ui';
import { delay, isError } from '@leather.io/utils';

import { finalizeAuthResponse } from '@shared/actions/finalize-auth-response';
import { logger } from '@shared/logger';

import { useGetLegacyAuthBitcoinAddresses } from '@app/common/authentication/use-legacy-auth-bitcoin-addresses';
import { useOnboardingState } from '@app/common/hooks/auth/use-onboarding-state';
import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useScrollLock } from '@app/common/hooks/use-scroll-lock';
import { makeLedgerCompatibleUnsignedAuthResponsePayload } from '@app/common/unsafe-auth-response';
import { useCancelLedgerAction } from '@app/features/ledger/utils/generic-ledger-utils';
import {
  getStacksAppVersion,
  prepareLedgerDeviceStacksAppConnection,
} from '@app/features/ledger/utils/stacks-ledger-utils';
import {
  useCurrentStacksAccount,
  useStacksAccounts,
} from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';

import { useLedgerNavigate } from '../../hooks/use-ledger-navigate';
import { checkLockedDeviceError, useLedgerResponseState } from '../../utils/generic-ledger-utils';
import {
  addSignatureToAuthResponseJwt,
  getSha256HashOfJwtAuthPayload,
  signLedgerJwtHash,
} from './jwt-signing.utils';
import { LedgerJwtSigningContext, LedgerJwtSigningProvider } from './ledger-sign-jwt.context';

export function LedgerSignJwtContainer() {
  const location = useLocation();
  const ledgerNavigate = useLedgerNavigate();
  useScrollLock(true);

  const activeAccount = useCurrentStacksAccount();
  const network = useCurrentStacksNetworkState();
  const accounts = useStacksAccounts();

  const getBitcoinAddressesLegacyFormat = useGetLegacyAuthBitcoinAddresses();

  const keyActions = useKeyActions();
  const { decodedAuthRequest, authRequest } = useOnboardingState();

  const [accountIndex, setAccountIndex] = useState<null | number>(null);

  useEffect(() => {
    const index = parseInt(get(location.state, 'index'), 10);
    if (Number.isFinite(index)) setAccountIndex(index);
  }, [location.state]);

  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();

  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);

  const [jwtPayloadHash, setJwtPayloadHash] = useState<null | string>(null);
  const { origin, tabId } = useDefaultRequestParams();

  const chain = 'stacks';

  const signJwtPayload = async () => {
    if (!origin) throw new Error('Cannot sign payload for unknown origin');

    if (accountIndex === null) {
      logger.warn('No account index found');
      return;
    }

    if (!activeAccount || !decodedAuthRequest || !authRequest || !accounts || !tabId) {
      logger.warn('No necessary state not found while performing JWT signing', {
        account: activeAccount,
        decodedAuthRequest,
        authRequest,
        accounts,
        tabId,
      });
      return;
    }

    const account = accounts[accountIndex];

    if (!account) {
      logger.warn('No account for given index found');
      return;
    }

    const stacks = await prepareLedgerDeviceStacksAppConnection({
      setLoadingState: setAwaitingDeviceConnection,
      onError(e) {
        if (isError(e) && checkLockedDeviceError(e)) {
          setLatestDeviceResponse({ deviceLocked: true } as any);
          return;
        }
        ledgerNavigate.toErrorStep(chain);
      },
    });

    const versionInfo = await getStacksAppVersion(stacks);
    setLatestDeviceResponse(versionInfo);

    if (versionInfo.deviceLocked) {
      setAwaitingDeviceConnection(false);
      return;
    }

    if (versionInfo.returnCode !== LedgerError.NoErrors) {
      logger.error('Return code from device has error', versionInfo);
      return;
    }

    // TODO: #4566 Low-grade code. This is to be removed when deprecating legacy APIs
    let legacyAddressObj = {};
    try {
      legacyAddressObj = getBitcoinAddressesLegacyFormat(accountIndex);
    } catch (e) {
      logger.error('Error while generating bitcoin addresses to return', e);
    }

    try {
      ledgerNavigate.toConnectionSuccessStep('stacks');
      await delay(1000);

      const authResponsePayload = await makeLedgerCompatibleUnsignedAuthResponsePayload({
        dataPublicKey: account.dataPublicKey,
        profile: {
          stxAddress: {
            testnet: getAddressFromPublicKey(account.stxPublicKey, network),
            mainnet: getAddressFromPublicKey(account.stxPublicKey, network),
          },
          ...legacyAddressObj,
        },
      });

      setJwtPayloadHash(getSha256HashOfJwtAuthPayload(authResponsePayload));

      ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: false });

      const resp = await signLedgerJwtHash(stacks)(authResponsePayload, accountIndex);

      if (resp.returnCode === LedgerError.TransactionRejected) {
        ledgerNavigate.toOperationRejectedStep();
        return;
      }

      ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: true });
      const authResponse = addSignatureToAuthResponseJwt(authResponsePayload, resp.signatureDER);
      await delay(600);
      keyActions.switchAccount(accountIndex);

      finalizeAuthResponse({
        decodedAuthRequest,
        authRequest,
        authResponse,
        requestingOrigin: origin,
        tabId,
      });
    } catch (e) {
      ledgerNavigate.toDeviceDisconnectStep();
    } finally {
      await stacks.transport.close();
    }
  };

  const onCancelConnectLedger = ledgerNavigate.cancelLedgerAction;

  const ledgerContextValue: LedgerJwtSigningContext = {
    signJwtPayload,
    jwtPayloadHash,
    latestDeviceResponse,
    awaitingDeviceConnection,
  };

  const canCancelLedgerAction = useCancelLedgerAction(awaitingDeviceConnection);

  return (
    <LedgerJwtSigningProvider value={ledgerContextValue}>
      <Sheet
        isShowing
        header={<SheetHeader />}
        onClose={canCancelLedgerAction ? () => onCancelConnectLedger() : undefined}
      >
        <Outlet />
      </Sheet>
    </LedgerJwtSigningProvider>
  );
}
