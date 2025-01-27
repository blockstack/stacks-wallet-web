import {
  FinishedTxPayload,
  PsbtData,
  SignatureData,
  SponsoredFinishedTxPayload,
} from '@stacks/connect';
import { PublicProfile } from '@stacks/profile';

export const MESSAGE_SOURCE = 'stacks-wallet';

export const CONTENT_SCRIPT_PORT = 'content-script';

export enum ExternalMethods {
  transactionRequest = 'hiroWalletTransactionRequest',
  transactionResponse = 'hiroWalletTransactionResponse',
  authenticationRequest = 'hiroWalletAuthenticationRequest',
  authenticationResponse = 'hiroWalletAuthenticationResponse',
  signatureRequest = 'hiroWalletSignatureRequest',
  signatureResponse = 'hiroWalletSignatureResponse',
  structuredDataSignatureRequest = 'hiroWalletStructuredDataSignatureRequest',
  structuredDataSignatureResponse = 'hiroWalletStructuredDataSignatureResponse',
  profileUpdateRequest = 'hiroWalletProfileUpdateRequest',
  profileUpdateResponse = 'hiroWalletProfileUpdateResponse',
  psbtRequest = 'hiroWalletPsbtRequest',
  psbtResponse = 'hiroWalletPsbtResponse',
}

export enum InternalMethods {
  RequestDerivedStxAccounts = 'RequestDerivedStxAccounts',
  OriginatingTabClosed = 'OriginatingTabClosed',
  AccountChanged = 'AccountChanged',
  TransactionBroadcast = 'TransactionBroadcast',
}

export type ExtensionMethods = ExternalMethods | InternalMethods;

interface BaseMessage {
  source: typeof MESSAGE_SOURCE;
  method: ExtensionMethods;
}

/**
 * Content Script <-> Background Script
 */
export interface Message<Methods extends ExtensionMethods, Payload = undefined>
  extends BaseMessage {
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

type SignatureRequestMessage = Message<ExternalMethods.signatureRequest, string>;

export type SignatureResponseMessage = Message<
  ExternalMethods.signatureResponse,
  {
    signatureRequest: string;
    signatureResponse: SignatureData | string;
  }
>;

type StructuredDataSignatureRequestMessage = Message<
  ExternalMethods.structuredDataSignatureRequest,
  string
>;

type ProfileUpdateRequestMessage = Message<ExternalMethods.profileUpdateRequest, string>;

export type ProfileUpdateResponseMessage = Message<
  ExternalMethods.profileUpdateResponse,
  {
    profileUpdateRequest: string;
    profileUpdateResponse: PublicProfile | string;
  }
>;

type PsbtRequestMessage = Message<ExternalMethods.psbtRequest, string>;

export type PsbtResponseMessage = Message<
  ExternalMethods.psbtResponse,
  {
    psbtRequest: string;
    psbtResponse: PsbtData | string;
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

export type LegacyMessageFromContentScript =
  | AuthenticationRequestMessage
  | TransactionRequestMessage
  | SignatureRequestMessage
  | StructuredDataSignatureRequestMessage
  | ProfileUpdateRequestMessage
  | PsbtRequestMessage;

export type LegacyMessageToContentScript =
  | AuthenticationResponseMessage
  | TransactionResponseMessage
  | SignatureResponseMessage
  | ProfileUpdateResponseMessage
  | PsbtResponseMessage;
