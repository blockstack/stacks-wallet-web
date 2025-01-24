import { AddressVersion, privateKeyToPublic, publicKeyToAddress } from '@stacks/transactions';

import { deriveStxPrivateKey } from '@leather.io/stacks';

import { mnemonicToRootNode } from '@app/common/keychain/keychain';

export function getStacksAddressByIndex(secretKey: string, addressVersion: AddressVersion) {
  return (index: number) => {
    const accountPrivateKey = deriveStxPrivateKey({
      keychain: mnemonicToRootNode(secretKey) as any,
      index,
    });

    const pubKey = privateKeyToPublic(accountPrivateKey);
    return publicKeyToAddress(addressVersion, pubKey);
  };
}
