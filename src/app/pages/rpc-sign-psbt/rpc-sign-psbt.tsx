import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { RpcErrorCode } from '@btckit/types';
import { bytesToHex } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';

import { logger } from '@shared/logger';
import { makeRpcErrorResponse, makeRpcSuccessResponse } from '@shared/rpc/rpc-methods';
import { isUndefined } from '@shared/utils';

import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { usePsbtSigner } from '@app/features/psbt-signer/hooks/use-psbt-signer';
import { PsbtSigner } from '@app/features/psbt-signer/psbt-signer';

function useRpcSignPsbtParams() {
  const [searchParams] = useSearchParams();
  const { origin, tabId } = useDefaultRequestParams();
  const requestId = searchParams.get('requestId');
  const psbtHex = searchParams.get('hex');
  const publicKey = searchParams.get('publicKey');
  const allowedSighash = searchParams.getAll('allowedSighash');
  const signAtIndex = searchParams.getAll('signAtIndex');

  if (!requestId || !psbtHex || !publicKey || !origin) throw new Error('Invalid params');

  return useMemo(
    () => ({
      origin,
      tabId: tabId ?? 0,
      requestId,
      psbtHex,
      publicKey,
      allowedSighash: allowedSighash.map(h => Number(h)) as btc.SignatureHash[],
      signAtIndex: signAtIndex.map(h => Number(h)),
    }),
    [allowedSighash, origin, psbtHex, publicKey, requestId, signAtIndex, tabId]
  );
}

function useRpcSignPsbt() {
  const { origin, tabId, requestId, psbtHex, allowedSighash, signAtIndex } = useRpcSignPsbtParams();
  const {
    signPsbtAtIndex,
    getDecodedPsbt,
    nativeSegwitSigner,
    taprootSigner,
    getPsbtAsTransaction,
  } = usePsbtSigner();

  const tx = getPsbtAsTransaction(psbtHex);

  return {
    origin,
    get decodedPsbt() {
      return getDecodedPsbt(psbtHex);
    },
    onSignPsbt() {
      if (!isUndefined(signAtIndex) && !isUndefined(allowedSighash)) {
        signAtIndex.forEach(idx => {
          signPsbtAtIndex(allowedSighash, idx, tx);
        });
      } else {
        try {
          nativeSegwitSigner?.sign(tx);
        } catch (e1) {
          try {
            taprootSigner?.sign(tx);
          } catch (e2) {
            logger.error('Error signing tx', e1, e2);
          }
        }
      }
      const psbt = tx.toPSBT();

      chrome.tabs.sendMessage(
        tabId,
        makeRpcSuccessResponse('signPsbt', { id: requestId, result: { hex: bytesToHex(psbt) } })
      );
      window.close();
    },
    onCancel() {
      chrome.tabs.sendMessage(
        tabId,
        makeRpcErrorResponse('signPsbt', {
          id: requestId,
          error: {
            message: 'User denied signing',
            code: RpcErrorCode.USER_REJECTION,
          },
        })
      );
    },
  };
}

export function RpcSignPsbt() {
  const { origin, decodedPsbt, onSignPsbt, onCancel } = useRpcSignPsbt();
  if (!decodedPsbt) return null;
  return (
    <PsbtSigner appName={origin} onSignPsbt={onSignPsbt} onCancel={onCancel} psbt={decodedPsbt} />
  );
}
