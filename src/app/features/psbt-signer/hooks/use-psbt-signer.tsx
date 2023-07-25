import { useMemo } from 'react';

import { hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';

import { logger } from '@shared/logger';
import { isString } from '@shared/utils';

import { useCurrentAccountNativeSegwitSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootSigner } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';

import { useSignPsbtError } from './use-sign-psbt-error';

export type DecodedPsbt = ReturnType<typeof btc.RawPSBTV0.decode>;

export function usePsbtSigner() {
  const signPsbtError = useSignPsbtError();
  const createNativeSegwitSigner = useCurrentAccountNativeSegwitSigner();
  const createTaprootSigner = useCurrentAccountTaprootSigner();

  const nativeSegwitSigner = createNativeSegwitSigner?.(0);
  const taprootSigner = createTaprootSigner?.(0);

  return useMemo(
    () => ({
      signPsbtAtIndex(idx: number, tx: btc.Transaction, allowedSighash?: btc.SignatureHash[]) {
        try {
          nativeSegwitSigner?.signIndex(tx, idx, allowedSighash);
        } catch (e1) {
          try {
            taprootSigner?.signIndex(tx, idx, allowedSighash);
          } catch (e2) {
            signPsbtError(`Error signing PSBT at provided index, ${e1}, ${e2}`);
          }
        }
      },
      signPsbt(tx: btc.Transaction) {
        try {
          nativeSegwitSigner?.sign(tx);
        } catch (e1) {
          try {
            taprootSigner?.sign(tx);
          } catch (e2) {
            signPsbtError(`Error signing PSBT, ${e1}, ${e2}`);
          }
        }
      },
      getPsbtAsTransaction(psbt: string | Uint8Array) {
        const bytes = isString(psbt) ? hexToBytes(psbt) : psbt;
        return btc.Transaction.fromPSBT(bytes);
      },
      getDecodedPsbt(psbt: string | Uint8Array) {
        const bytes = isString(psbt) ? hexToBytes(psbt) : psbt;
        try {
          return btc.RawPSBTV0.decode(bytes);
        } catch (e0) {
          logger.error(`Failed to decode as PSBT v0, trying v2, ${e0}`);
          try {
            return btc.RawPSBTV2.decode(bytes);
          } catch (e2) {
            signPsbtError(`Failed to decode PSBT as v0 and v2, ${e0}, ${e2}`);
          }
        }
        return;
      },
    }),
    [nativeSegwitSigner, signPsbtError, taprootSigner]
  );
}
