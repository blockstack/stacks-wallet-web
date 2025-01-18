import {
  CommonSignaturePayload as ConnectCommonSignaturePayload,
  ContractCallPayload as ConnectContractCallPayload,
  ContractDeployPayload as ConnectContractDeployPayload,
  ProfileUpdatePayload as ConnectProfileUpdatePayload,
  STXTransferPayload as ConnectSTXTransferPayload,
} from '@stacks/connect';
import type { StacksNetwork } from '@stacks/network';
import type { PostCondition, PostConditionWire } from '@stacks/transactions';
import { decodeToken } from 'jsontokens';

import type { ReplaceTypes } from '@leather.io/models';
import type { TransactionTypes } from '@leather.io/stacks';

// This file exists to support legacy requests and type inconsistencies from @stacks/connect

export type ContractCallPayload = ReplaceTypes<
  ConnectContractCallPayload,
  {
    txType: TransactionTypes.ContractCall;
    network: StacksNetwork;
    postConditions?: PostCondition[];
  }
>;
export type ContractDeployPayload = ReplaceTypes<
  ConnectContractDeployPayload,
  {
    txType: TransactionTypes.ContractDeploy;
    network: StacksNetwork;
    postConditions?: PostCondition[] | PostConditionWire[];
  }
>;
export type STXTransferPayload = ReplaceTypes<
  ConnectSTXTransferPayload,
  {
    txType: TransactionTypes.StxTokenTransfer;
    network: StacksNetwork;
    postConditions?: PostCondition[] | PostConditionWire[];
  }
>;
export type ProfileUpdatePayload = ReplaceTypes<
  ConnectProfileUpdatePayload,
  {
    network: StacksNetwork;
  }
>;
export type CommonSignaturePayload = ReplaceTypes<
  ConnectCommonSignaturePayload,
  {
    network: StacksNetwork;
  }
>;
export interface SignaturePayload extends CommonSignaturePayload {
  message: string;
}
export type TransactionPayload = ContractCallPayload | ContractDeployPayload | STXTransferPayload;

export function getLegacyTransactionPayloadFromToken(requestToken: string) {
  const token = decodeToken(requestToken);
  return token.payload as unknown as TransactionPayload;
}
