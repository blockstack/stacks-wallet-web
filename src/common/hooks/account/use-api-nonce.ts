import { lastApiNonceAtom } from '@store/accounts/nonce';
import { useUpdateAtom } from 'jotai/utils';
import { apiClientState } from '@store/common/api-clients';
import { currentAccountStxAddressState } from '@store/accounts';
import { useQuery } from 'react-query';
import { useAtomValue } from 'jotai/utils';
import { AddressNonces } from '@stacks/blockchain-api-client/lib/generated';

export const correctNextNonce = (apiNonce: AddressNonces): number | undefined => {
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
};

export function useApiNonce() {
  const setLastApiNonceAtom = useUpdateAtom(lastApiNonceAtom);
  const principal = useAtomValue(currentAccountStxAddressState);
  if (!principal) return;
  const { accountsApi } = useAtomValue(apiClientState);
  const fetchNonce = () => accountsApi.getAccountNonces({ principal });

  const { data: apiNonce } = useQuery(['apiNonce'], fetchNonce);
  if (!apiNonce) return;
  const nextNonce = correctNextNonce(apiNonce);
  if (typeof nextNonce === 'number') setLastApiNonceAtom(nextNonce);
  return apiNonce;
}
