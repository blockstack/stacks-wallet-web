import { AddressNonces } from '@stacks/blockchain-api-client/lib/generated';
import { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';

export enum NonceTypes {
  apiSuggestedNonce = 'api-suggested-nonce',
  clientFallbackNonce = 'client-fallback-nonce',
  undefinedNonce = 'undefined-nonce',
}

interface NextNonce {
  nonce?: number;
  nonceType: NonceTypes;
}

function confirmedTxsNoncesIncludesPossibleClientFallbackNonce(
  clientFallbackNonce: number,
  confirmedTransactions: Transaction[]
) {
  return confirmedTransactions.find(tx => tx.nonce === clientFallbackNonce);
}

function apiSuggestsImpossibleZeroNonceWithConfirmedTxs(
  confirmedTxsNonces: number[],
  possibleNextNonce: number
) {
  return possibleNextNonce === 0 && confirmedTxsNonces.length > 0;
}

function compareApiMissingNoncesWithPendingTxsNonces(
  confirmedTransactions: Transaction[],
  detectedMissingNonces: number[],
  lastConfirmedTxNonceIncremented: number,
  lastPendingTxNonceIncremented: number,
  pendingTxsNonces: number[],
  possibleNextNonce: number,
  pendingTxsNoncesIncludesApiPossibleNextNonce: boolean
) {
  const remainingMissingNonces = detectedMissingNonces.filter(
    nonce => !pendingTxsNonces.includes(nonce)
  );
  if (remainingMissingNonces.length > 0)
    return { nonce: Math.min(...remainingMissingNonces), nonceType: NonceTypes.apiSuggestedNonce };
  if (pendingTxsNoncesIncludesApiPossibleNextNonce) {
    if (
      // Check if suggesting the lastPendingTxNonceIncremented is actually already confirmed
      confirmedTxsNoncesIncludesPossibleClientFallbackNonce(
        lastPendingTxNonceIncremented,
        confirmedTransactions
      )
    )
      return { nonce: lastConfirmedTxNonceIncremented, nonceType: NonceTypes.clientFallbackNonce };
    return {
      nonce: lastPendingTxNonceIncremented,
      nonceType: NonceTypes.clientFallbackNonce,
    };
  }
  return { nonce: possibleNextNonce, nonceType: NonceTypes.apiSuggestedNonce };
}

function findAnyMissingPendingTxsNonces(pendingNonces: number[]) {
  const maxNonce = Math.max(...pendingNonces);
  const minNonce = Math.min(...pendingNonces);
  const missingNonces = [];

  for (let i = minNonce; i <= maxNonce; i++) {
    if (!pendingNonces.includes(i)) missingNonces.push(i);
  }
  return missingNonces;
}

interface ParseAccountNoncesResponseArgs {
  addressNonces?: AddressNonces;
  confirmedTransactions: Transaction[];
  pendingTransactions: MempoolTransaction[];
  senderAddress: string;
}
export function parseAccountNoncesResponse({
  addressNonces,
  confirmedTransactions,
  pendingTransactions,
  senderAddress,
}: ParseAccountNoncesResponseArgs): NextNonce {
  if (!addressNonces) return { nonce: undefined, nonceType: NonceTypes.undefinedNonce };

  const detectedMissingNonces = addressNonces.detected_missing_nonces;
  const lastExecutedNonce = addressNonces.last_executed_tx_nonce;
  const possibleNextNonce = addressNonces.possible_next_nonce;

  const firstMissingNonce = detectedMissingNonces?.sort()[0];
  const pendingTxsNonces = pendingTransactions
    .filter(tx => tx.sender_address === senderAddress)
    ?.map(tx => tx.nonce);
  const lastPendingTxNonce = pendingTransactions[0]?.nonce;
  const confirmedTxsNonces = confirmedTransactions
    .filter(tx => tx.sender_address === senderAddress)
    ?.map(tx => tx.nonce);
  const lastConfirmedTxNonceIncremented = confirmedTxsNonces.length && confirmedTxsNonces[0] + 1;
  const lastPendingTxNonceIncremented = lastPendingTxNonce + 1;
  const pendingTxsNoncesIncludesApiPossibleNextNonce = pendingTxsNonces.includes(possibleNextNonce);
  const pendingTxsMissingNonces = findAnyMissingPendingTxsNonces(pendingTxsNonces);
  const firstPendingMissingNonce = pendingTxsMissingNonces.sort()[0];

  const hasApiMissingNonces = detectedMissingNonces?.length > 0;
  const hasPendingTxs = pendingTransactions?.length > 0;
  const pendingTxsHasMissingNonces = pendingTxsMissingNonces.length > 0;
  const apiReturnsMissingNoncesAndPendingTransactions = hasApiMissingNonces && hasPendingTxs;
  const apiReturnsMissingNoncesButNoPendingTransactions = hasApiMissingNonces && !hasPendingTxs;
  const apiReturnsPendingTransactionsWithPossibleNextNonce =
    hasPendingTxs && pendingTxsNoncesIncludesApiPossibleNextNonce;
  const lastExecutedNonceIsNotTheFirstMissingNonce = lastExecutedNonce !== firstMissingNonce;

  if (apiSuggestsImpossibleZeroNonceWithConfirmedTxs(confirmedTxsNonces, possibleNextNonce))
    return {
      nonce: lastConfirmedTxNonceIncremented,
      nonceType: NonceTypes.clientFallbackNonce,
    };

  if (apiReturnsMissingNoncesAndPendingTransactions) {
    return compareApiMissingNoncesWithPendingTxsNonces(
      confirmedTransactions,
      detectedMissingNonces,
      lastConfirmedTxNonceIncremented,
      lastPendingTxNonceIncremented,
      pendingTxsNonces,
      possibleNextNonce,
      pendingTxsNoncesIncludesApiPossibleNextNonce
    );
  }

  if (apiReturnsMissingNoncesButNoPendingTransactions && lastExecutedNonceIsNotTheFirstMissingNonce)
    return { nonce: firstMissingNonce, nonceType: NonceTypes.apiSuggestedNonce };

  if (apiReturnsPendingTransactionsWithPossibleNextNonce) {
    if (pendingTxsHasMissingNonces)
      return { nonce: firstPendingMissingNonce, nonceType: NonceTypes.clientFallbackNonce };
    if (
      // Check if suggesting the lastPendingTxNonceIncremented is actually already confirmed
      confirmedTxsNoncesIncludesPossibleClientFallbackNonce(
        lastPendingTxNonceIncremented,
        confirmedTransactions
      )
    )
      return { nonce: lastConfirmedTxNonceIncremented, nonceType: NonceTypes.clientFallbackNonce };
    return {
      nonce: lastPendingTxNonceIncremented,
      nonceType: NonceTypes.clientFallbackNonce,
    };
  }

  return { nonce: possibleNextNonce, nonceType: NonceTypes.apiSuggestedNonce };
}
