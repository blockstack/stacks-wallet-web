import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { RateLimiter } from 'limiter';

import { contractsAtom } from '@store/contracts';
import { apiClientState } from '@store/common/api-clients';
import { ContractInterface } from '@stacks/rpc-client';

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: 2000 });

function useFetchContractInterface(contractAddress: string, contractName: string) {
  const api = useAtomValue(apiClientState);
  const [state, setState] = useAtom(contractsAtom);

  const contractInterfaceFetcher = useCallback(async () => {
    await limiter.removeTokens(1);
    return api.smartContractsApi.getContractInterface({ contractAddress, contractName });
  }, [api.smartContractsApi, contractAddress, contractName]);

  const { data: contractInterface } = useQuery(
    ['contactId', contractAddress, contractName],
    contractInterfaceFetcher,
    {
      staleTime: Number.MAX_SAFE_INTEGER,
      onSuccess(contract: ContractInterface) {
        setState({ ...state, [`${contractAddress}.${contractName}`]: contract });
      },
    }
  );
  return contractInterface as ContractInterface | undefined;
}

export function useQueryContractInterface(contractId: string) {
  const [address, name] = contractId.split('.');
  return useFetchContractInterface(address, name);
}
