import { ChainId } from '@stacks/network';
import BigNumber from 'bignumber.js';
import { c32addressDecode } from 'c32check';

import { STX_DECIMALS } from '@leather.io/constants';
import type { NetworkConfiguration } from '@leather.io/models';
import { initBigNumber, microStxToStx } from '@leather.io/utils';

import { isValidUrl } from '@shared/utils/validate-url';

import { abbreviateNumber } from '@app/common/utils';

import { convertUnicodeToAscii } from './string-utils';

export const stacksValue = ({
  value,
  fixedDecimals = true,
  withTicker = true,
  abbreviate = false,
}: {
  value: number | string | BigNumber;
  fixedDecimals?: boolean;
  withTicker?: boolean;
  abbreviate?: boolean;
}) => {
  const stacks = microStxToStx(value);
  const stxAmount = stacks.toNumber();
  return `${
    abbreviate && stxAmount > 10000
      ? abbreviateNumber(stxAmount)
      : stxAmount.toLocaleString('en-US', {
          maximumFractionDigits: fixedDecimals ? STX_DECIMALS : 3,
        })
  }${withTicker ? ' STX' : ''}`;
};

export const ftDecimals = (value: number | string | BigNumber, decimals: number) => {
  const amount = initBigNumber(value);
  return amount
    .shiftedBy(-decimals)
    .toNumber()
    .toLocaleString('en-US', { maximumFractionDigits: decimals });
};

export const ftUnshiftDecimals = (value: number | string | BigNumber, decimals: number) => {
  const amount = initBigNumber(value);
  return amount.shiftedBy(decimals).toString(10);
};

export const validateStacksAddress = (stacksAddress: string): boolean => {
  try {
    c32addressDecode(stacksAddress);
    return true;
  } catch (e) {
    return false;
  }
};

export function validateAddressChain(address: string, currentNetwork: NetworkConfiguration) {
  const prefix = address.slice(0, 2);
  switch (currentNetwork.chain.stacks.chainId) {
    case ChainId.Mainnet:
      return prefix === 'SM' || prefix === 'SP';
    case ChainId.Testnet:
      return prefix === 'SN' || prefix === 'ST';
    default:
      return false;
  }
}

export function isFtNameLikeStx(name: string) {
  return ['stx', 'stack', 'stacks'].includes(convertUnicodeToAscii(name).toLocaleLowerCase());
}

export function getSafeImageCanonicalUri(imageCanonicalUri: string, name: string) {
  return imageCanonicalUri && isValidUrl(imageCanonicalUri) && !isFtNameLikeStx(name)
    ? imageCanonicalUri
    : '';
}
