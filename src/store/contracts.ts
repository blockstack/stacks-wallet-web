import { atomFamilyWithQuery } from '@store/query';
import { ContractPrincipal } from '@common/asset-types';
import { apiClientState } from '@store/common/api-clients';
import { atomFamily } from 'jotai/utils';
import { atom } from 'jotai';
import { currentNetworkState } from '@store/networks';
import { getLocalData, setLocalData } from '@store/common/utils';
import deepEqual from 'fast-deep-equal';
import { ContractSourceResponse } from '@stacks/blockchain-api-client';
import { ContractInterface } from '@stacks/rpc-client';

enum ContractQueryKeys {
  ContractInterface = 'queries/ContractInterface',
  ContractSource = 'queries/ContractSource',
}

export type ContractDictionary = Record<string, ContractInterface>;

export const contractsAtom = atom<ContractDictionary>({});

export const contractInterfaceState = atomFamily<ContractPrincipal, ContractInterface | null>(
  ({ contractAddress, contractName }) => {
    const key = `${contractAddress}.${contractName}`;
    const anAtom = atom(get => {
      const contractsMap = get(contractsAtom);
      return contractsMap[key];
    });
    anAtom.debugLabel = `contractInterfaceState/${key}`;
    return anAtom;
  },
  deepEqual
);

export const contractSourceResponseState = atomFamilyWithQuery<
  ContractPrincipal,
  ContractSourceResponse
>(ContractQueryKeys.ContractSource, async (get, { contractAddress, contractName }) => {
  const { smartContractsApi } = get(apiClientState);
  const network = get(currentNetworkState);
  const data = await smartContractsApi.getContractSource({
    contractAddress,
    contractName,
  });
  const keyParams = [network.url, contractAddress, contractName, ContractQueryKeys.ContractSource];
  // for a given contract source, it does not change once deployed so we should cache it
  return setLocalData(keyParams, data);
});

export const contractSourceState = atomFamily<ContractPrincipal, ContractSourceResponse>(
  ({ contractAddress, contractName }) => {
    const anAtom = atom(get => {
      const network = get(currentNetworkState);
      const keyParams = [
        network.url,
        contractAddress,
        contractName,
        ContractQueryKeys.ContractSource,
      ];
      const localData = getLocalData<ContractSourceResponse>(keyParams);
      if (localData) return localData;
      return get(contractSourceResponseState({ contractAddress, contractName }));
    });
    anAtom.debugLabel = `contractSourceState/${contractAddress}.${contractName}`;
    return anAtom;
  },
  deepEqual
);
