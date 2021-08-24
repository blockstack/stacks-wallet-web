import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { useAtomValue } from 'jotai/utils';

import { apiClientState } from '@store/common/api-clients';

export function useFetchFeeRate() {
  const api = useAtomValue(apiClientState);

  const feeTransferFetcher = useCallback(
    () => api.feesApi.getFeeTransfer() as unknown as Promise<number>,
    [api.feesApi]
  );

  const { data: feeRate } = useQuery(['feeTransfer'], feeTransferFetcher);

  return feeRate;
}
