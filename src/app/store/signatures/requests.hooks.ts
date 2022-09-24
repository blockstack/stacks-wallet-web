import { useMemo } from 'react';
import { useAsync } from 'react-async-hook';

import {
  getGenericSignaturePayloadFromToken,
  verifySignatureRequest,
} from '@app/common/signature/requests';
import { useAccounts } from '@app/store/accounts/account.hooks';
import { useInitialRouteSearchParams } from '../common/initial-route-search-params.hooks';
import { isString } from '@shared/utils';
import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';

export function useSignatureRequestSearchParams() {
  const searchParams = useInitialRouteSearchParams();
  const { origin, tabId } = useDefaultRequestParams();

  return useMemo(() => {
    const requestToken = searchParams.get('request');

    const messageType = searchParams.get('messageType');

    return {
      tabId: isString(tabId) ? parseInt(tabId, 10) : tabId,
      requestToken,
      origin,
      messageType,
    };
  }, [origin, searchParams, tabId]);
}

function useSignatureRequestState() {
  const { requestToken } = useSignatureRequestSearchParams();
  return useMemo(() => {
    if (!requestToken) return null;
    return getGenericSignaturePayloadFromToken(requestToken);
  }, [requestToken]);
}

export function useSignatureRequestAccountIndex() {
  const signaturePayload = useSignatureRequestState();
  const accounts = useAccounts();

  if (!signaturePayload?.stxAddress) return;
  const { stxAddress } = signaturePayload;

  if (stxAddress && accounts) {
    return accounts.findIndex(account => account.address === stxAddress); // selected account
  }
  return undefined;
}

export function useIsSignatureRequestValid() {
  const accounts = useAccounts();
  const { origin, requestToken } = useSignatureRequestSearchParams();

  return useAsync(async () => {
    if (typeof accounts === 'undefined') return;
    if (!origin || !accounts || !requestToken) return;
    try {
      const valid = await verifySignatureRequest({
        requestToken,
        accounts,
        appDomain: origin,
      });
      return !!valid;
    } catch (e) {
      return false;
    }
  }, [accounts, requestToken, origin]).result;
}
