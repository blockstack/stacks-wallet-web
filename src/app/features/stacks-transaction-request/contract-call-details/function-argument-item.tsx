import { cvToString, deserializeCV, getCVTypeString } from '@stacks/transactions';

import { formatContractId } from '@leather.io/stacks';

import { logger } from '@shared/logger';

import { Row } from '@app/features/stacks-transaction-request/row';
import { useContractFunction } from '@app/query/stacks/contract.hooks';
import { useTransactionRequestState } from '@app/store/transactions/requests.hooks';

interface FunctionArgumentProps {
  arg: string;
  index: number;
}

export function FunctionArgumentItem(props: FunctionArgumentProps) {
  const { arg, index, ...rest } = props;
  const transactionRequest = useTransactionRequestState();
  const { data: contractFunction } = useContractFunction(transactionRequest);
  const argCV = deserializeCV(arg);
  const strValue = cvToString(argCV);

  if (!transactionRequest || transactionRequest.txType !== 'contract_call') return null;

  if (!contractFunction) {
    logger.error(
      `Attempting to call a function (\`${transactionRequest.functionName}\`) that ` +
        `does not exist on contract ${formatContractId(
          transactionRequest.contractAddress,
          transactionRequest.contractName
        )}`
    );
  }

  return (
    <Row
      name={<>{contractFunction?.args[index].name || 'unknown'}</>}
      type={getCVTypeString(argCV)}
      value={strValue}
      {...rest}
    />
  );
}
