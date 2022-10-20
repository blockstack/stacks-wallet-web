import { PayloadType, StacksTransaction } from '@stacks/transactions';

import { StacksTx } from '@shared/models/transactions/stacks-transaction.model';
import { stacksValue } from '@app/common/stacks-utils';
import { getTxCaption } from '@app/common/transactions/stacks/transaction.utils';

interface SubmittedTransactionDetails {
  caption: string | null;
  title: string;
  value: string | null;
}

interface GetSubmittedTransactionDetailsArgs {
  payload: StacksTransaction['payload'];
  senderAddress?: string;
  txId: string;
}
export function getSubmittedTransactionDetails({
  payload,
  senderAddress,
  txId,
}: GetSubmittedTransactionDetailsArgs): SubmittedTransactionDetails | null {
  switch (payload.payloadType) {
    case PayloadType.TokenTransfer:
      return {
        caption: getTxCaption({
          tx_type: 'token_transfer',
          tx_id: txId,
        } as StacksTx),
        title: 'Stacks Token',
        value: `-${stacksValue({
          value: Number(payload.amount),
          withTicker: false,
        })}`,
      };
    case PayloadType.ContractCall:
      return {
        caption: getTxCaption({
          tx_type: 'contract_call',
          contract_call: {
            contract_id: `.${payload.contractName.content}`,
          },
        } as unknown as StacksTx),
        title: payload.functionName.content,
        value: null,
      };
    case PayloadType.SmartContract:
      return {
        caption: getTxCaption({
          tx_type: 'smart_contract',
          smart_contract: {
            contract_id: `${senderAddress}.${payload.contractName.content}`,
          },
        } as unknown as StacksTx),
        title: payload.contractName.content,
        value: null,
      };
    default:
      return null;
  }
}
