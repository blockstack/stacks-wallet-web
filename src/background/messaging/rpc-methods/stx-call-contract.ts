import { TransactionTypes } from '@stacks/connect';
import { type ClarityValue, type PostCondition, serializeCV } from '@stacks/transactions';
import { createUnsecuredToken } from 'jsontokens';

import {
  RpcErrorCode,
  type StxCallContractRequest,
  type StxCallContractRequestParams,
} from '@leather.io/rpc';
import { getStacksContractIdStringParts } from '@leather.io/stacks';
import { isDefined, isUndefined } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import {
  getRpcStxCallContractParamErrors,
  validateRpcStxCallContractParams,
} from '@shared/rpc/methods/stx-call-contract';
import { makeRpcErrorResponse } from '@shared/rpc/rpc-methods';

import {
  RequestParams,
  encodePostConditions,
  getTabIdFromPort,
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../messaging-utils';
import { trackRpcRequestError, trackRpcRequestSuccess } from '../rpc-message-handler';

// TODO: Share SIP-30 default params
const messageParamsToTransactionRequest = (params: StxCallContractRequestParams) => {
  const { contractAddress, contractName } = getStacksContractIdStringParts(params.contract);

  const transactionRequest = {
    txType: TransactionTypes.ContractCall,
    contractAddress,
    contractName,
    functionArgs: (params.functionArgs ?? []).map(arg =>
      Buffer.from(serializeCV(arg as unknown as ClarityValue)).toString('hex')
    ),
    functionName: params.functionName,
  } as any;

  if (isDefined(params.address)) {
    transactionRequest.stxAddress = params.address;
  }
  if (isDefined(params.fee)) {
    transactionRequest.fee = params.fee;
  }
  if (isDefined(params.nonce)) {
    transactionRequest.nonce = params.nonce;
  }
  if (isDefined(params.postConditions)) {
    transactionRequest.postConditions = encodePostConditions(
      params.postConditions as PostCondition[]
    );
  }
  if (isDefined(params.postConditionMode)) {
    transactionRequest.postConditionMode = params.postConditionMode;
  }
  if (isDefined(params.sponsored)) {
    transactionRequest.sponsored = params.sponsored;
  }

  return transactionRequest;
};

export async function rpcStxCallContract(
  message: StxCallContractRequest,
  port: chrome.runtime.Port
) {
  if (isUndefined(message.params)) {
    void trackRpcRequestError({ endpoint: message.method, error: 'Undefined parameters' });
    chrome.tabs.sendMessage(
      getTabIdFromPort(port),
      makeRpcErrorResponse('stx_callContract', {
        id: message.id,
        error: { code: RpcErrorCode.INVALID_REQUEST, message: 'Parameters undefined' },
      })
    );
    return;
  }

  if (!validateRpcStxCallContractParams(message.params)) {
    void trackRpcRequestError({ endpoint: message.method, error: 'Invalid parameters' });

    chrome.tabs.sendMessage(
      getTabIdFromPort(port),
      makeRpcErrorResponse('stx_callContract', {
        id: message.id,
        error: {
          code: RpcErrorCode.INVALID_PARAMS,
          message: getRpcStxCallContractParamErrors(message.params),
        },
      })
    );
    return;
  }

  const request = messageParamsToTransactionRequest(message.params);

  void trackRpcRequestSuccess({ endpoint: message.method });

  const requestParams: RequestParams = [
    ['requestId', message.id],
    ['request', createUnsecuredToken(request)],
  ];

  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, requestParams);

  const { id } = await triggerRequestWindowOpen(RouteUrls.RpcStxCallContract, urlParams);

  listenForPopupClose({
    tabId,
    id,
    response: makeRpcErrorResponse('stx_callContract', {
      id: message.id,
      error: {
        code: RpcErrorCode.USER_REJECTION,
        message: 'User denied signing stacks transaction',
      },
    }),
  });
}
