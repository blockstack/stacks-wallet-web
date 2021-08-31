import React from 'react';
import type {
  Transaction,
  MempoolTransaction,
  TransactionEventFungibleAsset,
  CoinbaseTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { Box, BoxProps, Button, color, Stack } from '@stacks/ui';
import { getContractName, isPendingTx, truncateMiddle } from '@stacks/ui-utils';
import BigNumber from 'bignumber.js';

import { stacksValue } from '@common/stacks-utils';
import { useExplorerLink } from '@common/hooks/use-explorer-link';

import { Caption, Title } from '@components/typography';
import { SpaceBetween } from '@components/space-between';
import { TxItemIcon } from '@components/tx-icon';
import { Tooltip } from '@components/tooltip';
import { useCurrentAccount } from '@store/accounts/account.hooks';
import { usePressable } from '@components/item-hover';
import { useRawTxIdState } from '@store/transactions/raw.hooks';

type Tx = MempoolTransaction | Transaction;

const getAssetTransfer = (tx: Tx): TransactionEventFungibleAsset | null => {
  if (tx.tx_type !== 'contract_call') return null;
  if (tx.tx_status !== 'success') return null;
  const transfer = tx.events.find(event => event.event_type === 'fungible_token_asset');
  if (transfer?.event_type !== 'fungible_token_asset') return null;
  return transfer;
};

const getTxValue = (tx: Tx, isOriginator: boolean): number | string | null => {
  if (tx.tx_type === 'token_transfer') {
    return `${isOriginator ? '-' : ''}${stacksValue({
      value: tx.token_transfer.amount,
      withTicker: false,
    })}`;
  }
  const transfer = getAssetTransfer(tx);
  if (transfer) return new BigNumber(transfer.asset.amount).toFormat();
  return null;
};

interface TxItemProps {
  transaction: Tx;
}

const getTxCaption = (transaction: Tx) => {
  if (!transaction) return null;
  switch (transaction.tx_type) {
    case 'smart_contract':
      return truncateMiddle(transaction.smart_contract.contract_id, 4);
    case 'contract_call':
      return truncateMiddle(transaction.contract_call.contract_id, 4);
    case 'token_transfer':
    case 'coinbase':
    case 'poison_microblock':
      return truncateMiddle(transaction.tx_id);
    default:
      return null;
  }
};

const Status: React.FC<{ transaction: Tx } & BoxProps> = ({ transaction, ...rest }) => {
  const isPending = isPendingTx(transaction as any);
  const isFailed = !isPending && transaction.tx_status !== 'success';
  return isFailed || isPending ? (
    <Box {...rest}>
      {isPending && (
        <Caption variant="c2" color={color('feedback-alert')}>
          Pending
        </Caption>
      )}
      {isFailed && (
        <Tooltip
          placement="bottom"
          label={
            // TODO: better language around failure
            transaction.tx_status
          }
        >
          <Caption variant="c2" color={color('feedback-error')}>
            Failed
          </Caption>
        </Tooltip>
      )}
    </Box>
  ) : null;
};

const SpeedUpButton = ({ txid, isHovered }: { txid: string; isHovered: boolean }) => {
  const [rawTxId, setTxId] = useRawTxIdState();
  const isSelected = rawTxId === txid;
  return (
    <Button
      size="sm"
      mode="tertiary"
      fontSize={0}
      onClick={() => setTxId(txid)}
      zIndex={999}
      ml="auto"
      opacity={isSelected || !isHovered ? 0 : 1}
      pointerEvents={isSelected ? 'none' : 'all'}
    >
      Speed up tx
    </Button>
  );
};

export const TxItem: React.FC<TxItemProps & BoxProps> = ({ transaction, ...rest }) => {
  const [component, bind, { isHovered }] = usePressable(true);
  const { handleOpenTxLink } = useExplorerLink();
  const currentAccount = useCurrentAccount();

  if (!transaction) {
    return null;
  }

  const isOriginator = transaction.sender_address === currentAccount?.address;

  const getTxTitle = (tx: Tx) => {
    switch (tx.tx_type) {
      case 'token_transfer':
        return 'Stacks Token';
      case 'contract_call':
        return tx.contract_call.function_name;
      case 'smart_contract':
        return getContractName(tx.smart_contract.contract_id);
      case 'coinbase':
        return `Coinbase ${(tx as CoinbaseTransaction).block_height}`;
      case 'poison_microblock':
        return 'Poison Microblock';
    }
  };

  const value = getTxValue(transaction, isOriginator);

  return (
    <Box position="relative" cursor="pointer" {...bind} {...rest}>
      <Stack alignItems="center" spacing="base-loose" isInline position="relative" zIndex={2}>
        <TxItemIcon transaction={transaction} />
        <SpaceBetween flexGrow={1}>
          <Stack onClick={() => handleOpenTxLink(transaction.tx_id)}>
            <Title as="h3" fontWeight="normal">
              {getTxTitle(transaction as any)}
            </Title>
            <Stack isInline>
              <Status transaction={transaction} />
              {transaction.tx_type === 'token_transfer' ? (
                isOriginator ? (
                  <Caption variant="c2">Sent</Caption>
                ) : (
                  <Caption variant="c2">Received</Caption>
                )
              ) : null}
              <Caption variant="c2">{getTxCaption(transaction)}</Caption>
            </Stack>
          </Stack>
          <Stack alignItems="flex-end" spacing="base-tight">
            {value && (
              <Title as="h3" fontWeight="normal">
                {value}
              </Title>
            )}
            <SpeedUpButton isHovered={isHovered} txid={transaction.tx_id} />
          </Stack>
        </SpaceBetween>
      </Stack>
      {component}
    </Box>
  );
};
