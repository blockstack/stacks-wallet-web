import { useMemo } from 'react';

import { FungiblePostConditionWire, addressToString } from '@stacks/transactions';

import { isFtAsset, useGetFungibleTokenMetadataQuery } from '@leather.io/query';
import { ensurePostConditionWireFormat, getPostCondition } from '@leather.io/stacks';

import type { TransactionPayload } from '@shared/utils/legacy-requests';

import { handlePostConditions } from '@app/common/transactions/stacks/post-condition.utils';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { useTransactionRequestState } from './requests.hooks';

export function formatPostConditionState(payload?: TransactionPayload | null, address?: string) {
  if (!payload || !address) return;

  if (payload.postConditions) {
    if (payload.stxAddress)
      return handlePostConditions(
        payload.postConditions.map(pc => ensurePostConditionWireFormat(pc)),
        payload.stxAddress,
        address
      );

    return payload.postConditions.map(getPostCondition);
  }
  return [];
}

export function usePostConditionModeState() {
  return useTransactionRequestState()?.postConditionMode;
}

export function usePostConditionState() {
  const payload = useTransactionRequestState();
  const address = useCurrentStacksAccountAddress();
  return useMemo(() => formatPostConditionState(payload, address), [address, payload]);
}

export function useAssetFromFungiblePostCondition(pc: FungiblePostConditionWire) {
  const contractAddress = addressToString(pc.asset.address);
  const contractName = pc.asset.contractName.content;
  const contractId = `${contractAddress}.${contractName}`;
  const { data: asset } = useGetFungibleTokenMetadataQuery(contractId);

  return !(asset && isFtAsset(asset)) ? undefined : asset;
}
