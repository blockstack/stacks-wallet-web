import { Suspense } from 'react';

import { Stack } from 'leather-styles/jsx';

import { formatContractId } from '@leather.io/stacks';
import { Title } from '@leather.io/ui';

import { useStacksExplorerLink } from '@app/common/hooks/use-stacks-explorer-link';
import { AttachmentRow } from '@app/features/stacks-transaction-request/attachment-row';
import { ContractPreviewLayout } from '@app/features/stacks-transaction-request/contract-preview';
import { useTransactionRequestState } from '@app/store/transactions/requests.hooks';

import { FunctionArgumentsList } from './function-arguments-list';

function ContractCallDetailsSuspense() {
  const transactionRequest = useTransactionRequestState();
  const { handleOpenStacksTxLink } = useStacksExplorerLink();

  if (!transactionRequest || transactionRequest.txType !== 'contract_call') return null;
  const { contractAddress, contractName, functionName, attachment } = transactionRequest;

  return (
    <Stack
      border="active"
      borderRadius="sm"
      mb="space.05"
      px="space.04"
      py="32px"
      gap="space.05"
      width="100%"
      background="ink.background-primary"
    >
      <Title>Function and arguments</Title>

      <ContractPreviewLayout
        onClick={() =>
          handleOpenStacksTxLink({
            txid: formatContractId(contractAddress, contractName),
          })
        }
        contractAddress={contractAddress}
        contractName={contractName}
        functionName={functionName}
      />
      <Stack gap="space.04">
        <FunctionArgumentsList />
        {attachment && <AttachmentRow />}
      </Stack>
    </Stack>
  );
}

export function ContractCallDetails() {
  return (
    <Suspense fallback={<></>}>
      <ContractCallDetailsSuspense />
    </Suspense>
  );
}
