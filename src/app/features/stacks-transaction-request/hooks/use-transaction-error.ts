import { useMemo } from 'react';

import BigNumber from 'bignumber.js';
import { useFormikContext } from 'formik';

import {
  useCalculateStacksTxFees,
  useNextNonce,
  useStxCryptoAssetBalance,
} from '@leather.io/query';
import { TransactionTypes } from '@leather.io/stacks';
import { stxToMicroStx } from '@leather.io/utils';

import { StacksTransactionFormValues } from '@shared/models/form.model';

import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import { validateStacksAddress } from '@app/common/stacks-utils';
import { TransactionErrorReason } from '@app/features/stacks-transaction-request/transaction-error/transaction-error';
import { useCheckSbtcSponsorshipEligible } from '@app/query/sbtc/sponsored-transactions.hooks';
import { useGetContractInterfaceQuery } from '@app/query/stacks/contract.query';
import {
  useCurrentStacksAccount,
  useCurrentStacksAccountAddress,
} from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useTransactionRequestState } from '@app/store/transactions/requests.hooks';
import { useUnsignedStacksTransactionBaseState } from '@app/store/transactions/transaction.hooks';

function getIsMultisig() {
  return initialSearchParams.get('isMultisig') === 'true';
}

export function useTransactionError() {
  const transactionRequest = useTransactionRequestState();
  const contractInterface = useGetContractInterfaceQuery(transactionRequest);
  const { origin } = useDefaultRequestParams();
  const { values } = useFormikContext<StacksTransactionFormValues>();

  const currentAccount = useCurrentStacksAccount();
  const { filteredBalanceQuery } = useStxCryptoAssetBalance(currentAccount?.address ?? '');
  const availableUnlockedBalance = filteredBalanceQuery.data?.unlockedBalance;

  const unsignedTx = useUnsignedStacksTransactionBaseState();
  const stxAddress = useCurrentStacksAccountAddress();
  const { data: stxFees } = useCalculateStacksTxFees(unsignedTx.transaction);
  const { data: nextNonce } = useNextNonce(stxAddress);
  const { isVerifying: isVerifyingSbtcEligibilty, result: sbtcSponsorshipEligibility } =
    useCheckSbtcSponsorshipEligible(unsignedTx, nextNonce, stxFees);

  return useMemo<TransactionErrorReason | void>(() => {
    if (!origin) return TransactionErrorReason.ExpiredRequest;

    if (filteredBalanceQuery.isLoading || isVerifyingSbtcEligibilty) return;

    if (!transactionRequest || !availableUnlockedBalance || !currentAccount) {
      return TransactionErrorReason.Generic;
    }

    if (transactionRequest.txType === TransactionTypes.ContractCall) {
      if (!validateStacksAddress(transactionRequest.contractAddress))
        return TransactionErrorReason.InvalidContractAddress;
      if ((contractInterface as any)?.isError) return TransactionErrorReason.NoContract;
    }

    if (availableUnlockedBalance && !getIsMultisig()) {
      const zeroBalance = availableUnlockedBalance.amount.toNumber() === 0;

      if (transactionRequest.txType === TransactionTypes.StxTokenTransfer) {
        if (zeroBalance) return TransactionErrorReason.StxTransferInsufficientFunds;

        const transferAmount = new BigNumber(transactionRequest.amount);
        if (transferAmount.gte(availableUnlockedBalance.amount))
          return TransactionErrorReason.StxTransferInsufficientFunds;
      }

      if (!transactionRequest.sponsored && !sbtcSponsorshipEligibility?.isEligible) {
        if (zeroBalance) return TransactionErrorReason.FeeInsufficientFunds;

        const feeValue = stxToMicroStx(values.fee);
        if (feeValue.gte(availableUnlockedBalance.amount))
          return TransactionErrorReason.FeeInsufficientFunds;
      }
    }
    return;
  }, [
    filteredBalanceQuery.isLoading,
    origin,
    transactionRequest,
    contractInterface,
    availableUnlockedBalance,
    currentAccount,
    values.fee,
    isVerifyingSbtcEligibilty,
    sbtcSponsorshipEligibility,
  ]);
}
