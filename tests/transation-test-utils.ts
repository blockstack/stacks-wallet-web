import { ContractCallOptions, UserData, makeContractCallToken } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';
import {
  type FungiblePostCondition,
  PostConditionMode,
  postConditionToWire,
  serializePostConditionWire,
} from '@stacks/transactions';
import BN from 'bn.js';
import { vi } from 'vitest';

import { formatAssetString } from '@leather.io/stacks';

(window as any).fetch = vi.fn(() => ({
  text: () => Promise.resolve(1),
  ok: true,
}));

const defaultUserSession: Partial<UserData> = {
  appPrivateKey: 'e494f188c2d35887531ba474c433b1e41fadd8eb824aca983447fd4bb8b277a801',
};

export async function generateContractCallToken({
  userData,
  txOptions,
}: {
  userData?: Partial<UserData>;
  txOptions?: Partial<ContractCallOptions>;
} = {}) {
  const address = 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH';
  const contractAddress = 'ST34RKEJKQES7MXQFBT29KSJZD73QK3YNT5N56C6X';
  const contractName = 'test-asset-contract';
  const assetName = 'test-asset-name';

  const pc: FungiblePostCondition = {
    type: 'ft-postcondition',
    address,
    condition: 'gte',
    amount: new BN(100).toString(),
    asset: formatAssetString({ contractAddress, contractName, assetName }),
  };

  localStorage.setItem(
    'blockstack-session',
    JSON.stringify({
      userData: userData || defaultUserSession,
      version: '1.0.0',
    })
  );
  const network = STACKS_TESTNET;
  const txDataToken = await makeContractCallToken({
    contractAddress: 'ST1EXHZSN8MJSJ9DSG994G1V8CNKYXGMK7Z4SA6DH',
    contractName: 'hello-world',
    functionArgs: [],
    functionName: 'print',
    postConditionMode: PostConditionMode.Allow,
    network: network as any,
    postConditions: [serializePostConditionWire(postConditionToWire(pc))],
    ...txOptions,
  });
  return txDataToken;
}
