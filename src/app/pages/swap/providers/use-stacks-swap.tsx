import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { bytesToHex } from '@stacks/common';
import { type ContractCallPayload, TransactionTypes } from '@stacks/connect';
import { PostConditionMode } from '@stacks/transactions';
import { serializeCV } from '@stacks/transactions-v6';
import type { RouteQuote } from 'bitflow-sdk';

import { type SwapAsset } from '@leather.io/query';
import { isError, isUndefined } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';
import { bitflow } from '@shared/utils/bitflow-sdk';

import { LoadingKeys, useLoading } from '@app/common/hooks/use-loading';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentStacksNetworkStateV6 } from '@app/store/networks/networks.hooks';
import { generateStacksContractCallUnsignedTxV6 } from '@app/store/transactions/contract-call-v6';
import { useSignStacksTransactionV6 } from '@app/store/transactions/transaction.hooks';

import { useSponsorTransactionFees } from '../hooks/use-sponsor-tx-fees';
import { useStacksBroadcastSwap } from '../hooks/use-stacks-broadcast-swap';
import type { SubmitSwapArgs } from '../swap.context';
import type { StacksSwapContext } from './stacks-swap-provider';

export function useStacksSwap(nonce: number | string) {
  const { setIsLoading, setIsIdle, isLoading } = useLoading(LoadingKeys.SUBMIT_SWAP_TRANSACTION);
  const currentAccount = useCurrentStacksAccount();
  const signTx = useSignStacksTransactionV6();
  const broadcastStacksSwap = useStacksBroadcastSwap();
  const network = useCurrentStacksNetworkStateV6();
  const navigate = useNavigate();

  const { checkEligibilityForSponsor, submitSponsoredTx } = useSponsorTransactionFees();

  const fetchRouteQuote = useCallback(
    async (
      base: SwapAsset,
      quote: SwapAsset,
      baseAmount: string
    ): Promise<RouteQuote | undefined> => {
      if (!baseAmount || !base || !quote) return;
      try {
        const result = await bitflow.getQuoteForRoute(
          base.tokenId,
          quote.tokenId,
          Number(baseAmount)
        );
        if (!result.bestRoute) {
          logger.error('No swap route found');
          return;
        }
        return result.bestRoute;
      } catch (e) {
        logger.error('Error fetching exchange rate from Bitflow', e);
        return;
      }
    },
    []
  );

  const fetchQuoteAmount = useCallback(
    async (base: SwapAsset, quote: SwapAsset, baseAmount: string): Promise<string | undefined> => {
      const routeQuote = await fetchRouteQuote(base, quote, baseAmount);
      if (!routeQuote) return;
      return String(routeQuote.quote);
    },
    [fetchRouteQuote]
  );

  const onSubmitSwapForReview = useCallback(
    async ({ values, swapData }: SubmitSwapArgs<StacksSwapContext>) => {
      if (
        isUndefined(currentAccount) ||
        isUndefined(values.swapAssetBase) ||
        isUndefined(values.swapAssetQuote)
      ) {
        logger.error('Error submitting swap for review');
        return;
      }

      const routeQuote = await fetchRouteQuote(
        values.swapAssetBase,
        values.swapAssetQuote,
        values.swapAmountBase
      );

      if (!routeQuote) return;

      const swapExecutionData = {
        route: routeQuote.route,
        amount: Number(values.swapAmountBase),
        tokenXDecimals: routeQuote.tokenXDecimals,
        tokenYDecimals: routeQuote.tokenYDecimals,
      };

      const swapParams = await bitflow.getSwapParams(
        swapExecutionData,
        currentAccount.address,
        swapData.slippage
      );

      const payload: ContractCallPayload = {
        txType: TransactionTypes.ContractCall,
        contractAddress: swapParams.contractAddress,
        contractName: swapParams.contractName,
        functionName: swapParams.functionName,
        functionArgs: swapParams.functionArgs.map(x => bytesToHex(serializeCV(x))),
        postConditionMode: PostConditionMode.Deny,
        postConditions: swapParams.postConditions,
        publicKey: currentAccount?.stxPublicKey,
        sponsored: false,
        network,
      };

      const unsignedTx = await generateStacksContractCallUnsignedTxV6(payload, {
        fee: swapData.fee?.amount.toNumber(),
        nonce,
      });

      if (!unsignedTx)
        return logger.error('Attempted to generate unsigned tx, but tx is undefined');

      const sponsorship = await checkEligibilityForSponsor({
        transaction: unsignedTx,
        options: { ...payload, nonce },
      });

      return { routeQuote, sponsorship, unsignedTx };
    },
    [currentAccount, fetchRouteQuote, network, nonce, checkEligibilityForSponsor]
  );

  const onSubmitSwap = useCallback(
    async ({ values, swapData }: SubmitSwapArgs<StacksSwapContext>) => {
      if (isLoading) return;

      if (isUndefined(currentAccount)) {
        logger.error('Error submitting swap data to sign');
        return;
      }

      if (isUndefined(values.swapAssetBase) || isUndefined(values.swapAssetQuote)) {
        logger.error('No assets selected to perform swap');
        return;
      }

      setIsLoading();

      try {
        if (swapData.sponsorship?.isEligible)
          return await submitSponsoredTx(swapData.sponsorship.unsignedSponsoredTx!);

        if (!swapData.unsignedTx) return logger.error('No unsigned tx to sign');

        const signedTx = await signTx(swapData.unsignedTx);
        if (!signedTx)
          return logger.error('Attempted to generate raw tx, but signed tx is undefined');

        return await broadcastStacksSwap(signedTx);
      } catch (e) {
        navigate(RouteUrls.SwapError, {
          state: {
            message: isError(e) ? e.message : '',
            title: 'Swap Error',
          },
        });
      } finally {
        setIsIdle();
      }
    },
    [
      broadcastStacksSwap,
      currentAccount,
      isLoading,
      navigate,
      setIsIdle,
      setIsLoading,
      signTx,
      submitSponsoredTx,
    ]
  );

  return {
    fetchQuoteAmount,
    onSubmitSwapForReview,
    onSubmitSwap,
  };
}
