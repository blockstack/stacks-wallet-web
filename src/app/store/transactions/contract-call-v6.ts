import { hexToBytes } from '@stacks/common';
import type { ContractCallPayload } from '@stacks/connect';
import {
  AnchorMode,
  BytesReader,
  type PostCondition,
  PostConditionMode,
  type UnsignedContractCallOptions,
  deserializeCV,
  deserializePostCondition,
  makeUnsignedContractCall,
} from '@stacks/transactions-v6';
import BigNumber from 'bignumber.js';

import { isString } from '@leather.io/utils';

import { StacksTransactionFormValues } from '@shared/models/form.model';

import { initNonce } from '@app/common/transactions/stacks/generate-unsigned-txs';

function getPostConditionFromString(postCondition: string): PostCondition {
  try {
    const reader = new BytesReader(hexToBytes(postCondition));
    return deserializePostCondition(reader);
  } catch {
    throw new Error('Not a serialized post condition');
  }
}

function getPostCondition(postCondition: string | PostCondition): PostCondition {
  return isString(postCondition) ? getPostConditionFromString(postCondition) : postCondition;
}

export function generateStacksContractCallUnsignedTxV6(
  payload: ContractCallPayload,
  values: Partial<StacksTransactionFormValues>
) {
  const {
    contractName,
    contractAddress,
    functionName,
    functionArgs,
    sponsored,
    postConditionMode,
    postConditions,
    network,
    publicKey,
  } = payload;

  const fnArgs = functionArgs.map(arg => deserializeCV(arg));

  const options = {
    anchorMode: AnchorMode.Any,
    contractName,
    contractAddress,
    functionName,
    publicKey,
    functionArgs: fnArgs,
    nonce: initNonce(Number(values.nonce))?.toString(),
    fee: new BigNumber(values.fee ?? 0).toString(),
    postConditionMode: postConditionMode ?? PostConditionMode.Deny,
    postConditions: postConditions?.map(getPostCondition),
    network,
    sponsored,
  } satisfies UnsignedContractCallOptions;

  return makeUnsignedContractCall(options);
}
