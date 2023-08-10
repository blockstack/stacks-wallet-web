import { DefineRpcMethod, RpcRequest, RpcResponse } from '@btckit/types';
import { AllowAdditionalProperties } from '@btckit/types/dist/types/utils';

interface BitcoinContractResponseParams extends AllowAdditionalProperties {
  bitcoinContractOffer: string;
  attestorURLs: string;
  counterpartyWalletDetails: string;
}

interface BitcoinContractResponseBody extends AllowAdditionalProperties {
  contractId?: string;
  txId?: string;
}

export enum BitcoinContractResponseStatus {
  SUCCESS = 'Accepting Bitcoin Contract offer was successful',
  BROADCAST_ERROR = 'There was an error while broadcasting the Bitcoin Contract transaction',
  INTERFACE_ERROR = 'There was an error while interacting with the Bitcoin Contract interface',
  NETWORK_ERROR = "The wallet's current selected network is not supported",
  REJECTED = 'Bitcoin Contract offer was rejected',
}

export type BitcoinContractRequest = RpcRequest<
  'acceptBitcoinContractOffer',
  BitcoinContractResponseParams
>;
type BitcoinContractResponse = RpcResponse<BitcoinContractResponseBody>;
export type AcceptBitcoinContract = DefineRpcMethod<
  BitcoinContractRequest,
  BitcoinContractResponse
>;
