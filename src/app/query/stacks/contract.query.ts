import { useQuery } from '@tanstack/react-query';

import { type StacksClient, StacksQueryPrefixes, useStacksClient } from '@leather.io/query';
import { TransactionTypes } from '@leather.io/stacks';

import type { ContractCallPayload, TransactionPayload } from '@shared/utils/legacy-requests';

const queryOptions = {
  staleTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;

interface CreateGetContractInterfaceQueryOptionsArgs {
  client: StacksClient;
  transactionRequest: TransactionPayload | null;
}
export function createGetContractInterfaceQueryOptions({
  client,
  transactionRequest,
}: CreateGetContractInterfaceQueryOptionsArgs) {
  return {
    enabled: !!transactionRequest && transactionRequest.txType === TransactionTypes.ContractCall,
    queryKey: [
      StacksQueryPrefixes.GetContractInterface,
      (transactionRequest as ContractCallPayload)?.contractName,
      (transactionRequest as ContractCallPayload)?.contractAddress,
    ],
    queryFn: () => {
      if (!transactionRequest || transactionRequest?.txType !== TransactionTypes.ContractCall)
        return;
      const contractAddress = transactionRequest.contractAddress;
      const contractName = transactionRequest.contractName;
      return client.getContractInterface(contractAddress, contractName);
    },
    ...queryOptions,
  } as const;
}

export function useGetContractInterfaceQuery(transactionRequest: TransactionPayload | null) {
  const client = useStacksClient();
  return useQuery(createGetContractInterfaceQueryOptions({ client, transactionRequest }));
}
