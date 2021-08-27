import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { decodeToken } from 'jsontokens';
import { DecodedAuthRequest } from '@common/dev/types';
import { useWallet } from '@common/hooks/use-wallet';
import { getRequestOrigin, StorageKey } from '@common/storage';
import { ScreenPaths } from '@common/types';
import { useOnboardingState } from './use-onboarding-state';
import { authRequestState, currentScreenState } from '@store/onboarding';
import { useUpdateAtom } from 'jotai/utils';

export function useSaveAuthRequest() {
  const { wallet } = useWallet();
  const { screen } = useOnboardingState();
  const changeScreen = useUpdateAtom(currentScreenState);
  const saveAuthRequest = useUpdateAtom(authRequestState);
  const location = useLocation();
  const accounts = wallet?.accounts;
  const saveAuthRequestParam = useCallback(
    (authRequest: string) => {
      const { payload } = decodeToken(authRequest);
      const decodedAuthRequest = payload as unknown as DecodedAuthRequest;
      const origin = getRequestOrigin(StorageKey.authenticationRequests, authRequest);
      let appName = decodedAuthRequest.appDetails?.name;
      let appIcon = decodedAuthRequest.appDetails?.icon;

      if (!appIcon) {
        throw new Error('Missing `appIcon` from auth request');
      }
      if (!appName) {
        throw new Error('Missing `appName` from auth request');
      }

      saveAuthRequest({
        decodedAuthRequest,
        authRequest,
        appName,
        appIcon,
        appURL: new URL(origin),
      });

      const hasIdentities = accounts && accounts.length;
      if ((screen === ScreenPaths.GENERATION || screen === ScreenPaths.SIGN_IN) && hasIdentities) {
        changeScreen(ScreenPaths.CHOOSE_ACCOUNT);
      }
    },
    [changeScreen, saveAuthRequest, screen, accounts]
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const authRequest = urlParams.get('authRequest');
    if (authRequest) {
      saveAuthRequestParam(authRequest);
    }
  }, [location.search, saveAuthRequestParam]);
}
