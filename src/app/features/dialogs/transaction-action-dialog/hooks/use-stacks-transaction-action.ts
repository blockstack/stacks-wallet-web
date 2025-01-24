import { useCallback } from 'react';

import * as yup from 'yup';

import {
  useGetTransactionByIdQuery,
  useStacksRawTransaction,
  useStxAvailableUnlockedBalance,
} from '@leather.io/query';
import { TransactionTypes, getStacksBurnAddress } from '@leather.io/stacks';
import { stxToMicroStx } from '@leather.io/utils';

import { useRefreshAllAccountData } from '@app/common/hooks/account/use-refresh-all-account-data';
import {
  type GenerateUnsignedTransactionOptions,
  generateUnsignedTransaction,
} from '@app/common/transactions/stacks/generate-unsigned-txs';
import { StacksTransactionActionType } from '@app/common/transactions/stacks/transaction.utils';
import { stxFeeValidator } from '@app/common/validation/forms/fee-validators';
import { useStacksBroadcastTransaction } from '@app/features/stacks-transaction-request/hooks/use-stacks-broadcast-transaction';
import {
  useCurrentStacksAccount,
  useCurrentStacksAccountAddress,
} from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';

interface UseStacksTransactionActionArgs {
  actionType: StacksTransactionActionType;
  txid: string;
}

export function useStacksTransactionAction({ actionType, txid }: UseStacksTransactionActionArgs) {
  const refreshAccountData = useRefreshAllAccountData();
  const { stacksBroadcastTransaction, isBroadcasting } = useStacksBroadcastTransaction({
    token: 'STX',
    actionType,
  });

  const stacksAddress = useCurrentStacksAccountAddress();
  const availableUnlockedBalance = useStxAvailableUnlockedBalance(stacksAddress);
  const validationSchema = yup.object({ fee: stxFeeValidator(availableUnlockedBalance) });

  const { data: tx, isLoading: isLoadingTx } = useGetTransactionByIdQuery(txid);
  const { isLoadingRawTx, rawTx } = useStacksRawTransaction(txid);

  const network = useCurrentStacksNetworkState();
  const account = useCurrentStacksAccount();

  const onSubmitCancelTx = useCallback(
    async (fee: number) => {
      if (!tx || !rawTx || !account) return;
      const options: GenerateUnsignedTransactionOptions = {
        publicKey: account.stxPublicKey,
        nonce: tx.nonce,
        fee: stxToMicroStx(fee).toNumber(),
        txData: {
          txType: TransactionTypes.StxTokenTransfer,
          recipient: getStacksBurnAddress(network.chainId),
          amount: 1,
          memo: '_cancel transaction',
          network: network,
        } as any,
      };
      const newTx = await generateUnsignedTransaction(options);
      await refreshAccountData();
      await stacksBroadcastTransaction(newTx);
    },
    [tx, rawTx, account, network, refreshAccountData, stacksBroadcastTransaction]
  );

  const onSubmitIncreaseFeeTx = useCallback(
    async (fee: number) => {
      if (!tx || !rawTx) return;
      rawTx.setFee(stxToMicroStx(fee).toString());
      await refreshAccountData();
      await stacksBroadcastTransaction(rawTx);
    },
    [tx, refreshAccountData, stacksBroadcastTransaction, rawTx]
  );

  function onSubmit(values: { fee?: number | undefined }) {
    const fee = values.fee;

    if (!fee) return;

    if (actionType === StacksTransactionActionType.Cancel) {
      return onSubmitCancelTx(fee);
    }

    if (actionType === StacksTransactionActionType.IncreaseFee) {
      return onSubmitIncreaseFeeTx(fee);
    }

    throw new Error('Provide action type');
  }

  return {
    isBroadcasting,
    availableUnlockedBalance,
    isLoadingRawTx,
    isLoadingTx,
    onSubmitCancelTx,
    rawTx,
    tx,
    validationSchema,
    onSubmit,
  };
}
