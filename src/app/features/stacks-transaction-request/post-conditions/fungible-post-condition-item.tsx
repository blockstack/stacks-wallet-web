import { Suspense } from 'react';

import { type FungiblePostConditionWire, addressToString } from '@stacks/transactions';

import { TransactionTypes } from '@leather.io/stacks';
import { truncateMiddle } from '@leather.io/utils';

import { ftDecimals, getSafeImageCanonicalUri } from '@app/common/stacks-utils';
import {
  getAmountFromPostCondition,
  getIconStringFromPostCondition,
  getNameFromPostCondition,
  getPostConditionCodeMessage,
  getPostConditionTitle,
  getSymbolFromPostCondition,
} from '@app/common/transactions/stacks/post-condition.utils';
import { EventCard } from '@app/components/event-card';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useAssetFromFungiblePostCondition } from '@app/store/transactions/post-conditions.hooks';
import { useTransactionRequestState } from '@app/store/transactions/requests.hooks';

interface FungiblePostConditionItemProps {
  isLast?: boolean;
  pc: FungiblePostConditionWire;
}

function FungiblePostConditionItemSuspense(
  props: FungiblePostConditionItemProps
): React.JSX.Element | null {
  const { isLast, pc } = props;
  const currentAccount = useCurrentStacksAccount();
  const pendingTransaction = useTransactionRequestState();
  // Use token meta data if available
  const asset = useAssetFromFungiblePostCondition(pc);
  const imageCanonicalUri =
    asset?.image_canonical_uri &&
    asset.name &&
    getSafeImageCanonicalUri(asset.image_canonical_uri, asset.name);

  const title = getPostConditionTitle(pc);
  const iconString = imageCanonicalUri ?? getIconStringFromPostCondition(pc);
  const pcTicker = getSymbolFromPostCondition(pc);
  const pcAmount = getAmountFromPostCondition(pc);
  const name = getNameFromPostCondition(pc);

  const contractName = 'contractName' in pc.principal && pc.principal.contractName.content;
  const address = 'address' in pc.principal ? addressToString(pc.principal.address) : '';
  const isSending = address === currentAccount?.address;

  const amount = asset?.decimals ? ftDecimals(pcAmount, asset.decimals) : pcAmount;
  const ticker = asset?.symbol || pcTicker;

  const isContractPrincipal =
    !!contractName ||
    (pendingTransaction?.txType == TransactionTypes.ContractCall &&
      pendingTransaction.contractAddress === address) ||
    address.includes('.');

  if (!pendingTransaction) return null;

  const message = pc.conditionCode
    ? `${getPostConditionCodeMessage(
        pc.conditionCode,
        isSending
      )} ${amount} ${ticker} or the transaction will abort.`
    : undefined;

  return (
    <EventCard
      title={`${
        isContractPrincipal ? 'The contract ' : isSending ? 'You ' : 'Another address '
      } ${title}`}
      left={asset?.name || name}
      right={`${truncateMiddle(address, 4)}${contractName ? `.${contractName}` : ''}`}
      amount={amount}
      ticker={ticker}
      icon={iconString}
      message={message}
      isLast={isLast}
    />
  );
}

export function FungiblePostConditionItem(
  props: FungiblePostConditionItemProps
): React.JSX.Element {
  return (
    <Suspense fallback={<LoadingSpinner height="190px" />}>
      <FungiblePostConditionItemSuspense {...props} />
    </Suspense>
  );
}
