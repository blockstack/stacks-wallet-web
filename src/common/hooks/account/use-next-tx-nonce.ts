import { lastApiNonceState } from '@store/accounts/nonce';
import { AddressNonces } from '@stacks/blockchain-api-client/lib/generated';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useGetAccountNonce } from '@common/hooks/account/use-get-account-nonce';

export function correctNextNonce(apiNonce: AddressNonces): number | undefined {
  if (!apiNonce) return;

  const missingNonces = apiNonce.detected_missing_nonces;
  if (
    missingNonces &&
    missingNonces.length > 0 &&
    missingNonces[0] > (apiNonce.last_executed_tx_nonce || 0) &&
    missingNonces[0] > (apiNonce.last_mempool_tx_nonce || 0)
  ) {
    return missingNonces[0];
  }
  return apiNonce.possible_next_nonce;
}

export function useNextTxNonce() {
  const [nonce, setLastApiNonce] = useAtom(lastApiNonceState);
  const { data } = useGetAccountNonce();
  useEffect(() => {
    const nextNonce = data && correctNextNonce(data);
    if (typeof nextNonce === 'number') setLastApiNonce(nextNonce);
  });
  return nonce;
}
