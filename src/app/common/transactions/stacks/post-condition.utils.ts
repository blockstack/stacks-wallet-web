import {
  FungibleConditionCode,
  type FungiblePostConditionWire,
  NonFungibleConditionCode,
  type NonFungiblePostConditionWire,
  PostConditionType,
  type PostConditionWire,
  type STXPostConditionWire,
  addressToString,
  parsePrincipalString,
} from '@stacks/transactions';

import { getPostCondition } from '@leather.io/stacks';

import { stacksValue } from '@app/common/stacks-utils';

export const getIconStringFromPostCondition = (
  pc: STXPostConditionWire | FungiblePostConditionWire | NonFungiblePostConditionWire
) => {
  if (pc.conditionType === PostConditionType.Fungible)
    return `${addressToString(pc.asset.address)}.${pc.asset.contractName}.${
      pc.asset.assetName.content
    }`;
  if (pc.conditionType === PostConditionType.STX) return 'STX';
  return pc.asset.assetName.content;
};

export const getAmountFromPostCondition = (
  pc: STXPostConditionWire | FungiblePostConditionWire | NonFungiblePostConditionWire
) => {
  if (pc.conditionType === PostConditionType.Fungible) return pc.amount.toString();
  if (pc.conditionType === PostConditionType.STX)
    return stacksValue({ value: pc.amount.toString(), withTicker: false });
  return '';
};

export const getSymbolFromPostCondition = (
  pc: STXPostConditionWire | FungiblePostConditionWire | NonFungiblePostConditionWire
) => {
  if ('asset' in pc) {
    return pc.asset.assetName.content.slice(0, 3).toUpperCase();
  }
  return 'STX';
};

export const getNameFromPostCondition = (
  pc: STXPostConditionWire | FungiblePostConditionWire | NonFungiblePostConditionWire
) => {
  if ('asset' in pc) {
    return pc.asset.assetName.content;
  }
  return 'STX';
};

export function getPostConditionCodeMessage(
  code: FungibleConditionCode | NonFungibleConditionCode,
  isSender: boolean
) {
  const sender = isSender ? 'You' : 'The contract';
  switch (code) {
    case FungibleConditionCode.Equal:
      return `${sender} will transfer exactly`;
    case FungibleConditionCode.Greater:
      return `${sender} will transfer more than`;
    case FungibleConditionCode.GreaterEqual:
      return `${sender} will transfer at least`;
    case FungibleConditionCode.Less:
      return `${sender} will transfer less than`;
    case FungibleConditionCode.LessEqual:
      return `${sender} will transfer at most`;
    case NonFungibleConditionCode.Sends:
      return `${sender} will transfer`;
    case NonFungibleConditionCode.DoesNotSend:
      return `${sender} will keep or receive`;
  }
}

/**
 * This method will update a post conditions principal
 * value to the current address principal if and only if
 * the `stxAddress` value from the original tx payload
 * matches the address in the original post condition
 *
 * This is used when a user might switch accounts during
 * the signing process. One can assume that if the post
 * condition has the principal set to the same value as the
 * `stxAddress` value, it should be updated when they switch
 * accounts.
 */
export function handlePostConditions(
  postConditions: PostConditionWire[],
  payloadAddress: string,
  currentAddress: string
): PostConditionWire[] {
  const payloadPrincipal = parsePrincipalString(payloadAddress);
  const currentAddressPrincipal = parsePrincipalString(currentAddress);

  return postConditions.map(postCondition => {
    const formattedPostCondition = getPostCondition(postCondition);
    if (
      'contractName' in formattedPostCondition.principal ||
      !('address' in formattedPostCondition.principal)
    )
      return formattedPostCondition;
    const { principal, ...payload } = formattedPostCondition;
    const sameType = payloadPrincipal.address.type === principal.address.type;
    const sameHash = payloadPrincipal.address.hash160 === principal.address.hash160;
    const isOriginatorAddress = sameHash && sameType;
    return {
      ...payload,
      principal: isOriginatorAddress ? currentAddressPrincipal : principal,
    };
  });
}

const getTitleFromConditionCode = (code: FungibleConditionCode | NonFungibleConditionCode) => {
  switch (code) {
    case FungibleConditionCode.Equal:
      return 'will transfer exactly';
    case FungibleConditionCode.Greater:
      return 'will transfer more than';
    case FungibleConditionCode.GreaterEqual:
      return 'will transfer equal to or greater than';
    case FungibleConditionCode.Less:
      return 'will transfer less than';
    case FungibleConditionCode.LessEqual:
      return 'will transfer less than or equal to';
    case NonFungibleConditionCode.Sends:
      return 'will transfer';
    case NonFungibleConditionCode.DoesNotSend:
      return 'will keep';
    default:
      return '';
  }
};

export const getPostConditionTitle = (
  pc: STXPostConditionWire | FungiblePostConditionWire | NonFungiblePostConditionWire
) => {
  return getTitleFromConditionCode(pc.conditionCode) || '';
};
