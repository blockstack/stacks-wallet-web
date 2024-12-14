import * as btc from '@scure/btc-signer';
import { bytesToHex, hexToBytes } from '@stacks/common';
import * as P from 'micro-packed';
import {
  BitcoinNetwork,
  DEFAULT_UTXO_TO_SPENDABLE,
  REGTEST,
  SpendableByScriptTypes,
  UtxoWithTx,
  VSIZE_INPUT_P2WPKH,
  dustMinimum,
  paymentInfo,
  shUtxoToSpendable,
  stacksAddressBytes,
} from 'sbtc';

const concat = P.utils.concatBytes;

export function buildSbtcDepositScript(opts: {
  maxSignerFee: number;
  stacksAddress: string;
  signersPublicKey: string;
}) {
  const maxSignerFeeBytes = P.U64BE.encode(BigInt(opts.maxSignerFee));
  const recipientBytes = stacksAddressBytes(opts.stacksAddress);
  const signersPublicKeyBytes = hexToBytes(opts.signersPublicKey);

  return btc.Script.encode([
    concat(maxSignerFeeBytes, recipientBytes),
    'DROP',
    signersPublicKeyBytes,
    'CHECKSIG',
  ]);
}

export function buildSbtcReclaimScript(opts: { lockTime: number }) {
  return btc.Script.encode([
    btc.ScriptNum().encode(BigInt(opts.lockTime)),
    'CHECKSEQUENCEVERIFY', // sbtc-bridge code does twice with additional optional data before
  ]);
}

export function buildSbtcDepositTr(opts: {
  network: BitcoinNetwork;
  stacksAddress: string;
  signersPublicKey: string;
  maxSignerFee: number;
  lockTime: number;
}) {
  const deposit = buildSbtcDepositScript(opts);
  const reclaim = buildSbtcReclaimScript(opts);

  const UNSPENDABLE_PUB = new Uint8Array([
    0x50, 0x92, 0x9b, 0x74, 0xc1, 0xa0, 0x49, 0x54, 0xb7, 0x8b, 0x4b, 0x60, 0x35, 0xe9, 0x7a, 0x5e,
    0x07, 0x8a, 0x5a, 0x0f, 0x28, 0xec, 0x96, 0xd5, 0x47, 0xbf, 0xee, 0x9a, 0xce, 0x80, 0x3a, 0xc0,
  ]);

  return {
    depositScript: bytesToHex(deposit),
    reclaimScript: bytesToHex(reclaim),

    trOut: btc.p2tr(
      UNSPENDABLE_PUB,
      [{ script: deposit }, { script: reclaim }],
      opts.network,
      true // allow custom scripts
    ),
  };
}

export function buildSbtcDepositTx({
  network = REGTEST,
  amountSats,
  stacksAddress,
  signersPublicKey,
  maxSignerFee,
  reclaimLockTime,
}: {
  network: BitcoinNetwork;
  amountSats: number;
  stacksAddress: string;
  /** Aggregated (schnorr) public key of all signers */
  signersPublicKey: string;
  maxSignerFee: number;
  reclaimLockTime: number;
}) {
  // todo: check opts, e.g. pub key length to be schnorr

  const tr = buildSbtcDepositTr({
    network,
    stacksAddress,
    signersPublicKey,
    maxSignerFee,
    lockTime: reclaimLockTime,
  });
  if (!tr.trOut.address) throw new Error('Failed to create build taproot output');

  const tx = new btc.Transaction();
  tx.addOutputAddress(tr.trOut.address, BigInt(amountSats), network);

  return { transaction: tx, ...tr };
}

export async function sbtcDepositHelper({
  network = REGTEST,
  amountSats,
  stacksAddress,
  bitcoinChangeAddress,
  signersPublicKey,
  feeRate,
  utxos,
  utxoToSpendable = DEFAULT_UTXO_TO_SPENDABLE,
  paymentPublicKey,
  maxSignerFee = 80_000,
  reclaimLockTime = 6_000,
}: {
  /** Bitcoin network, defaults to REGTEST */
  network?: BitcoinNetwork;
  /** Signers public key (aggregated schnorr) */
  signersPublicKey: string;

  /** Bitcoin amount denominated in sats (* 10^8) */
  amountSats: number;
  /** The deposit recipient Stacks address */
  stacksAddress: string;
  /** Bitcoin change address */
  bitcoinChangeAddress: string;
  /** Fee rate in sat/vbyte */
  feeRate: number;
  /** UTXOs to use for the transaction */
  utxos: UtxoWithTx[];

  /**
   * Tries to convert p2wpk and p2sh utxos to spendable inputs by default.
   * To extend, add your own function that takes a {@link UtxoToSpendableOpts}
   * and returns a {@link Spendable}.
   *
   * @example
   * ```ts
   * utxoToSpendable: [
   *   wpkh: myWpkhUtxoToSpendableFn,
   *   sh: myShUtxoToSpendableFn,
   *   // ...
   * ]
   * ```
   */
  utxoToSpendable?: Partial<SpendableByScriptTypes>;

  /** Optional maximum fee to pay for the deposit transaction, defaults to 80_000 */
  maxSignerFee?: number;
  /** Optional reclaim lock time, defaults to 6_000 */
  reclaimLockTime?: number;

  /** Optional payment public key (currently only used for the default `utxoToSpendable.sh` implementation) */
  paymentPublicKey?: string;
}) {
  if (paymentPublicKey) {
    utxoToSpendable.sh = shUtxoToSpendable.bind(null, network, paymentPublicKey);
  }

  const txInfo = buildSbtcDepositTx({
    network,
    amountSats,
    stacksAddress,
    signersPublicKey,
    maxSignerFee,
    reclaimLockTime,
  });

  // We separate this part, since wallets could handle it themselves
  const pay = await paymentInfo({ tx: txInfo.transaction, feeRate, utxos, utxoToSpendable });
  for (const input of pay.inputs) txInfo.transaction.addInput(input);

  const changeAfterAdditionalOutput =
    pay.changeSats - BigInt(Math.ceil(VSIZE_INPUT_P2WPKH * feeRate));
  if (changeAfterAdditionalOutput > dustMinimum(VSIZE_INPUT_P2WPKH, feeRate)) {
    txInfo.transaction.addOutputAddress(bitcoinChangeAddress, changeAfterAdditionalOutput, network);
  }

  return txInfo;
}
