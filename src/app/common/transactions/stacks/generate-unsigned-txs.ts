import {
  ClarityVersion,
  type UnsignedContractCallOptions,
  type UnsignedContractDeployOptions,
  deserializeCV,
  makeUnsignedContractCall,
  makeUnsignedContractDeploy,
  makeUnsignedSTXTokenTransfer,
} from '@stacks/transactions';
import BN from 'bn.js';

import {
  TransactionTypes,
  ensurePostConditionWireFormat,
  getPostConditions,
  isTransactionTypeSupported,
} from '@leather.io/stacks';

import {
  type ContractCallPayload,
  type ContractDeployPayload,
  type STXTransferPayload,
} from '@shared/utils/legacy-requests';

function initNonce(nonce?: number) {
  return nonce !== undefined ? new BN(nonce, 10) : undefined;
}

interface GenerateUnsignedTxArgs<TxPayload> {
  txData: TxPayload;
  publicKey: string;
  fee: number | string;
  nonce?: number;
}

type GenerateUnsignedContractCallTxArgs = GenerateUnsignedTxArgs<ContractCallPayload>;

function generateUnsignedContractCallTx(args: GenerateUnsignedContractCallTxArgs) {
  const { txData, publicKey, nonce, fee } = args;
  const {
    contractName,
    contractAddress,
    functionName,
    functionArgs,
    sponsored,
    postConditionMode,
    postConditions,
    network,
  } = txData;

  const fnArgs = functionArgs.map(arg => deserializeCV(arg));

  const options = {
    contractName,
    contractAddress,
    functionName,
    publicKey,
    functionArgs: fnArgs,
    nonce: initNonce(nonce)?.toString(),
    fee: new BN(fee, 10).toString(),
    postConditionMode: postConditionMode,
    postConditions,
    network,
    sponsored,
  } satisfies UnsignedContractCallOptions;
  return makeUnsignedContractCall(options);
}

type GenerateUnsignedContractDeployTxArgs = GenerateUnsignedTxArgs<ContractDeployPayload>;

function generateUnsignedContractDeployTx(args: GenerateUnsignedContractDeployTxArgs) {
  const { txData, publicKey, nonce, fee } = args;
  const { contractName, codeBody, network, postConditions, postConditionMode } = txData;
  const options = {
    contractName,
    codeBody,
    nonce: initNonce(nonce)?.toString(),
    fee: new BN(fee, 10)?.toString(),
    publicKey,
    postConditionMode: postConditionMode,
    postConditions: getPostConditions(postConditions?.map(pc => ensurePostConditionWireFormat(pc))),
    network,
    clarityVersion: ClarityVersion.Clarity3,
  } satisfies UnsignedContractDeployOptions;

  return makeUnsignedContractDeploy(options);
}

type GenerateUnsignedStxTransferTxArgs = GenerateUnsignedTxArgs<STXTransferPayload>;

function generateUnsignedStxTransferTx(args: GenerateUnsignedStxTransferTxArgs) {
  const { txData, publicKey, nonce, fee } = args;
  const { recipient, memo, amount, network } = txData;
  const options = {
    recipient,
    memo,
    publicKey,
    amount: new BN(amount).toString(),
    nonce: initNonce(nonce)?.toString(),
    fee: new BN(fee, 10).toString(),
    network,
  };
  return makeUnsignedSTXTokenTransfer(options);
}

export type GenerateUnsignedTransactionOptions = GenerateUnsignedTxArgs<
  ContractCallPayload | STXTransferPayload | ContractDeployPayload
>;
export async function generateUnsignedTransaction(options: GenerateUnsignedTransactionOptions) {
  const { txData, publicKey, nonce, fee } = options;
  const isValid = isTransactionTypeSupported(txData.txType);

  if (!isValid) throw new Error(`Invalid Transaction Type: ${txData.txType}`);

  switch (txData.txType) {
    case TransactionTypes.StxTokenTransfer:
      return generateUnsignedStxTransferTx({ txData, publicKey, nonce, fee });
    case TransactionTypes.ContractCall:
      return generateUnsignedContractCallTx({ txData, publicKey, nonce, fee });
    case TransactionTypes.ContractDeploy:
      return generateUnsignedContractDeployTx({ txData, publicKey, nonce, fee });
  }
}
