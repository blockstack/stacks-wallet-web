import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useStacksClient } from '@leather.io/query';
import { getStacksAssetStringParts } from '@leather.io/stacks';

import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { useConfigSbtc } from '../common/remote-config/remote-config.query';

export const defaultSbtcLimits = {
  pegCap: 1000000000000,
  perDepositMinimum: 100000,
  perDepositCap: 100000000,
  perWithdrawalCap: 100000000,
  accountCaps: {},
};

interface GetSbtcLimitsResponse {
  pegCap: number;
  perDepositCap: number;
  perWithdrawalCap: number;
  perDepositMinimum: number;
  accountCaps: Record<any, any>;
}

async function getSbtcLimits(apiUrl: string): Promise<GetSbtcLimitsResponse> {
  const resp = await axios.get(`${apiUrl}/limits`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return resp.data;
}

export function useGetSbtcLimits() {
  const { emilyApiUrl } = useConfigSbtc();
  return useQuery({
    queryKey: ['get-sbtc-limits'],
    queryFn: () => getSbtcLimits(emilyApiUrl),
  });
}

export function useGetCurrentSbtcSupply() {
  const client = useStacksClient();
  const { contractId } = useConfigSbtc();
  const { contractAddress } = getStacksAssetStringParts(contractId);
  const stxAddress = useCurrentStacksAccountAddress();

  return useQuery({
    queryKey: ['get-current-sbtc-supply'],
    queryFn: () =>
      client.callReadOnlyFunction({
        contractAddress,
        contractName: 'sbtc-token',
        functionName: 'get-total-supply',
        readOnlyFunctionArgs: { sender: stxAddress, arguments: [] },
      }),
  });
}
