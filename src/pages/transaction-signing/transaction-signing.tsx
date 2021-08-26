import React, { memo, useEffect, useState } from 'react';
import { PopupHeader } from '@pages/transaction-signing/components/popup-header';
import { PopupContainer } from '@components/popup/container';
import { TransactionsActions } from '@pages/transaction-signing/components/actions';
import { TransactionError } from './components/transaction-error';
import { TransactionPageTop } from '@pages/transaction-signing/components/transaction-page-top';
import { ContractCallDetails } from '@pages/transaction-signing/components/contract-call-details';
import { ContractDeployDetails } from '@pages/transaction-signing/components/contract-deploy-details';
import { PostConditions } from '@pages/transaction-signing/components/post-conditions/list';
import { StxTransferDetails } from '@pages/transaction-signing/components/stx-transfer-details';
import { useTransactionRequest } from '@common/hooks/use-transaction-request';
import { Stack, IconButton } from '@stacks/ui';
import { useUpdateAtom } from 'jotai/utils';
import { transactionBroadcastErrorState } from '@store/transactions';
import { TxSettings } from '@pages/send-tokens/transaction-settings';
import { SpaceBetween } from '@components/space-between';
import { FiChevronUp as IconChevronUp, FiChevronDown as IconChevronDown } from 'react-icons/fi';

export const TransactionPage = memo(() => {
  const transactionRequest = useTransactionRequest();
  const setBroadcastError = useUpdateAtom(transactionBroadcastErrorState);
  if (!transactionRequest) return null;

  const editTxSettings = () => {
    setShowSettings(!showSettings);
  };
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    return () => {
      setBroadcastError(null);
    };
  }, [setBroadcastError]);

  return (
    <PopupContainer header={<PopupHeader />}>
      <Stack spacing="loose">
        <TransactionPageTop />
        <TransactionError />
        <PostConditions />
        {transactionRequest.txType === 'contract_call' && <ContractCallDetails />}
        {transactionRequest.txType === 'token_transfer' && <StxTransferDetails />}
        {transactionRequest.txType === 'smart_contract' && <ContractDeployDetails />}
        <SpaceBetween flexDirection="row-reverse">
          <IconButton
            onClick={editTxSettings}
            icon={showSettings ? IconChevronUp : IconChevronDown}
          />
        </SpaceBetween>
        {showSettings ? <TxSettings /> : null}
        <TransactionsActions />
      </Stack>
    </PopupContainer>
  );
});
