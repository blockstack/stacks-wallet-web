import { FinishedTxPayload, SponsoredFinishedTxPayload } from '@stacks/connect';

export const MESSAGE_SOURCE = 'stacks-wallet' as const;

export const CONTENT_SCRIPT_PORT = 'content-script' as const;

export enum ExternalMethods {
  transactionRequest = 'transactionRequest',
  transactionResponse = 'transactionResponse',
  authenticationRequest = 'authenticationRequest',
  authenticationResponse = 'authenticationResponse',
}

export enum InternalMethods {
  getWallet = 'getWallet',
  makeWallet = 'makeWallet',
  storeSeed = 'storeSeed',
  createNewAccount = 'createNewAccount',
  signOut = 'signOut',
  setPassword = 'setPassword',
  switchAccountIndex = 'switchAccountIndex',
  unlockWallet = 'unlockWallet',
  lockWallet = 'lockWallet',
  switchAccount = 'switchAccount',
}

export type ExtensionMethods = ExternalMethods | InternalMethods;

interface BaseMessage {
  source: typeof MESSAGE_SOURCE;
  method: ExtensionMethods;
}

/**
 * Content Script <-> Background Script
 */
export interface Message<Methods extends ExtensionMethods, Payload> extends BaseMessage {
  method: Methods;
  payload: Payload;
}

type AuthenticationRequestMessage = Message<ExternalMethods.authenticationRequest, string>;

export type AuthenticationResponseMessage = Message<
  ExternalMethods.authenticationResponse,
  {
    authenticationRequest: string;
    authenticationResponse: string;
  }
>;

type TransactionRequestMessage = Message<ExternalMethods.transactionRequest, string>;

export type TxResult = SponsoredFinishedTxPayload | FinishedTxPayload;

export type TransactionResponseMessage = Message<
  ExternalMethods.transactionResponse,
  {
    transactionRequest: string;
    transactionResponse: TxResult | string;
  }
>;

export type MessageFromContentScript = AuthenticationRequestMessage | TransactionRequestMessage;
export type MessageToContentScript = AuthenticationResponseMessage | TransactionResponseMessage;
