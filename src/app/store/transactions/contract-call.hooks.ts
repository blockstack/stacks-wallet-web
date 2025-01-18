import { useCallback } from 'react';

import { useNextNonce } from '@leather.io/query';

import { StacksTransactionFormValues } from '@shared/models/form.model';
import type { ContractCallPayload } from '@shared/utils/legacy-requests';

import {
  GenerateUnsignedTransactionOptions,
  generateUnsignedTransaction,
} from '@app/common/transactions/stacks/generate-unsigned-txs';

import { useCurrentStacksAccount } from '../accounts/blockchain/stacks/stacks-account.hooks';

export function useGenerateStacksContractCallUnsignedTx() {
  const account = useCurrentStacksAccount();

  const { data: nextNonce } = useNextNonce(account?.address ?? '');

  return useCallback(
    async (payload: ContractCallPayload, values: Partial<StacksTransactionFormValues>) => {
      if (!account) return;

      const options: GenerateUnsignedTransactionOptions = {
        publicKey: account.stxPublicKey,
        nonce: Number(values?.nonce) ?? nextNonce?.nonce,
        fee: values.fee ?? 0,
        txData: payload,
      };
      const transaction = await generateUnsignedTransaction(options);
      return { transaction, options };
    },
    [account, nextNonce?.nonce]
  );
}
