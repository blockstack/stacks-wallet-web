import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { useBitcoinClient } from '@app/store/common/api-clients.hooks';
import { BitcoinTransaction } from '@shared/models/transactions/bitcoin-transaction.model';

const staleTime = 15 * 60 * 1000;

const queryOptions = {
  cacheTime: staleTime,
};

export function useGetBitcoinTransactionsByAddressQuery(address: string) {
  const client = useBitcoinClient();

  return useQuery({
    enabled: !!address,
    queryKey: ['btc-txs-by-address', address],
    queryFn: () => client.addressApi.getTransactionsByAddress(address),
    ...queryOptions,
  }) as UseQueryResult<BitcoinTransaction[], Error>;
}
