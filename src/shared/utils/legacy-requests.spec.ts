import { HEYSTACK_HEY_TX_REQUEST } from '@tests/mocks';

import { TransactionTypes } from '@leather.io/stacks';

import { getLegacyTransactionPayloadFromToken } from './legacy-requests';

describe(getLegacyTransactionPayloadFromToken.name, () => {
  it('verifies payload', () => {
    const result = getLegacyTransactionPayloadFromToken(HEYSTACK_HEY_TX_REQUEST);
    expect(result?.txType).toEqual(TransactionTypes.ContractCall);
  });
});
