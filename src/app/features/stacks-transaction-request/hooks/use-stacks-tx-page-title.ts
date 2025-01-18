import { useMemo } from 'react';

import { TransactionTypes } from '@leather.io/stacks';

import { useTransactionRequestState } from '@app/store/transactions/requests.hooks';

export function useStacksTxPageTitle() {
  const transactionRequest = useTransactionRequestState();
  const txType = transactionRequest?.txType;
  return useMemo(() => {
    if (!transactionRequest) return '';
    if (txType === TransactionTypes.StxTokenTransfer) return 'Confirm transfer';
    if (txType === TransactionTypes.ContractDeploy) return 'Deploy contract';
    if (txType === TransactionTypes.ContractCall && 'functionName' in transactionRequest)
      return transactionRequest.functionName || 'Sign transaction';
    return 'Sign transaction';
  }, [transactionRequest, txType]);
}
