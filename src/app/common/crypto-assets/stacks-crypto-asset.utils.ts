import { FungibleTokenMetadata } from '@stacks/blockchain-api-client';

import { StacksFungibleTokenAsset } from '@shared/models/crypto-asset.model';
import { isUndefined } from '@shared/utils';
import { isValidUrl } from '@shared/utils/validate-url';

import { abbreviateNumber } from '@app/common/utils';

import { convertUnicodeToAscii } from '../string-utils';

function removeCommas(amountWithCommas: string) {
  return amountWithCommas.replace(/,/g, '');
}

export function getFormattedBalance(amount: string) {
  const noCommas = removeCommas(amount);
  const number = noCommas.includes('.') ? parseFloat(noCommas) : parseInt(noCommas);
  return number > 10000
    ? {
        isAbbreviated: true,
        value: abbreviateNumber(number),
      }
    : { value: amount, isAbbreviated: false };
}

export function isFtNameLikeStx(name: string) {
  return ['stx', 'stack', 'stacks'].includes(convertUnicodeToAscii(name).toLocaleLowerCase());
}

export function getImageCanonicalUri(imageCanonicalUri: string, name: string) {
  return imageCanonicalUri && isValidUrl(imageCanonicalUri) && !isFtNameLikeStx(name)
    ? imageCanonicalUri
    : '';
}

// Metadata is used here temporarily until we have the new Hiro API types
export function isTransferableStacksFungibleTokenAsset(
  asset: StacksFungibleTokenAsset,
  metadata: FungibleTokenMetadata
) {
  return (
    !('error' in metadata) &&
    !isUndefined(asset.decimals) &&
    !isUndefined(asset.name) &&
    !isUndefined(asset.symbol)
  );
}
