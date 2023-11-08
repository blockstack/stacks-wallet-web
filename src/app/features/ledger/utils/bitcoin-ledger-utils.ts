import Transport from '@ledgerhq/hw-transport-webusb';
import { Psbt } from 'bitcoinjs-lib';
import BitcoinApp, { DefaultWalletPolicy } from 'ledger-bitcoin';
import { PartialSignature } from 'ledger-bitcoin/build/main/lib/appClient';

import { BitcoinNetworkModes } from '@shared/constants';
import { getTaprootAccountDerivationPath } from '@shared/crypto/bitcoin/p2tr-address-gen';
import { getNativeSegwitAccountDerivationPath } from '@shared/crypto/bitcoin/p2wpkh-address-gen';

export interface BitcoinLedgerAccountDetails {
  id: string;
  path: string;
  policy: string;
  targetId: string;
}

export async function connectLedgerBitcoinApp() {
  const transport = await Transport.create();
  return new BitcoinApp(transport);
}

export async function getBitcoinAppVersion(app: BitcoinApp) {
  return app.getAppAndVersion();
}

export interface WalletPolicyDetails {
  fingerprint: string;
  network: BitcoinNetworkModes;
  xpub: string;
  accountIndex: number;
}

// Function that takes a derivation path generator fn and uses that to derive a
// wallet policy string from it
// E.g.[844b93a0/84'/0'/2']xpub6CQGqQ…gNfC21xp8r
function derivationPathToWalletPolicy(
  makePath: (network: BitcoinNetworkModes, accountIndex: number) => string
) {
  return ({ network, accountIndex, fingerprint, xpub }: WalletPolicyDetails) =>
    '[' + makePath(network, accountIndex).replace('m', fingerprint) + ']' + xpub;
}

export function createNativeSegwitDefaultWalletPolicy(policyDetails: WalletPolicyDetails) {
  return new DefaultWalletPolicy(
    'wpkh(@0/**)',
    derivationPathToWalletPolicy(getNativeSegwitAccountDerivationPath)(policyDetails)
  );
}

export function createTaprootDefaultWalletPolicy(policyDetails: WalletPolicyDetails) {
  return new DefaultWalletPolicy(
    'tr(@0/**)',
    derivationPathToWalletPolicy(getTaprootAccountDerivationPath)(policyDetails)
  );
}

export function addNativeSegwitSignaturesToPsbt(
  psbt: Psbt,
  signatures: [number, PartialSignature][]
) {
  signatures.forEach(([index, signature]) => psbt.updateInput(index, { partialSig: [signature] }));
}

export function addTaprootInputSignaturesToPsbt(
  psbt: Psbt,
  signatures: [number, PartialSignature][]
) {
  signatures.forEach(([index, signature]) =>
    psbt.updateInput(index, { tapKeySig: signature.signature })
  );
}
