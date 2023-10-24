import { useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { bytesToHex } from '@stacks/common';
import { ContractCallPayload, TransactionTypes } from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
  serializeCV,
  serializePostCondition,
} from '@stacks/transactions';
import BigNumber from 'bignumber.js';

import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';
import { isDefined, isUndefined } from '@shared/utils';

import { LoadingKeys, useLoading } from '@app/common/hooks/use-loading';
import { NonceSetter } from '@app/components/nonce-setter';
import { defaultFeesMinValues } from '@app/query/stacks/fees/fees.hooks';
import { useStacksPendingTransactions } from '@app/query/stacks/mempool/mempool.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useGenerateStacksContractCallUnsignedTx } from '@app/store/transactions/contract-call.hooks';
import { useSignTransactionSoftwareWallet } from '@app/store/transactions/transaction.hooks';

import { SwapContainerLayout } from './components/swap-container.layout';
import { SwapForm } from './components/swap-form';
import { useAlexBroadcastSwap } from './hooks/use-alex-broadcast-swap';
import { oneHundredMillion, useAlexSwap } from './hooks/use-alex-swap';
import { useStacksBroadcastSwap } from './hooks/use-stacks-broadcast-swap';
import { SwapAsset, SwapFormValues } from './hooks/use-swap-form';
import { SwapContext, SwapProvider } from './swap.context';
import { migratePositiveBalancesToTop, sortSwappableAssetsBySymbol } from './swap.utils';

export function SwapContainer() {
  const [isSendingMax, setIsSendingMax] = useState(false);
  const navigate = useNavigate();
  const { setIsLoading } = useLoading(LoadingKeys.SUBMIT_SWAP_TRANSACTION);
  const currentAccount = useCurrentStacksAccount();
  const generateUnsignedTx = useGenerateStacksContractCallUnsignedTx();
  const signSoftwareWalletTx = useSignTransactionSoftwareWallet();
  const { transactions: pendingTransactions } = useStacksPendingTransactions();

  const isSponsoredByAlex = !pendingTransactions.length;

  const {
    alexSDK,
    fetchToAmount,
    createSwapAssetFromAlexCurrency,
    onSetSwapSubmissionData,
    slippage,
    supportedCurrencies,
    swapSubmissionData,
  } = useAlexSwap();

  const broadcastAlexSwap = useAlexBroadcastSwap(alexSDK);
  const broadcastStacksSwap = useStacksBroadcastSwap();

  const swappableAssets: SwapAsset[] = useMemo(
    () =>
      sortSwappableAssetsBySymbol(
        supportedCurrencies.map(createSwapAssetFromAlexCurrency).filter(isDefined)
      ),
    [createSwapAssetFromAlexCurrency, supportedCurrencies]
  );

  async function onSubmitSwapForReview(values: SwapFormValues) {
    if (isUndefined(values.swapAssetFrom) || isUndefined(values.swapAssetTo)) {
      logger.error('Error submitting swap for review');
      return;
    }

    const [router, lpFee] = await Promise.all([
      alexSDK.getRouter(values.swapAssetFrom.currency, values.swapAssetTo.currency),
      alexSDK.getFeeRate(values.swapAssetFrom.currency, values.swapAssetTo.currency),
    ]);

    onSetSwapSubmissionData({
      fee: isSponsoredByAlex ? '0' : defaultFeesMinValues[1].amount.toString(),
      feeCurrency: values.feeCurrency,
      feeType: values.feeType,
      liquidityFee: new BigNumber(Number(lpFee)).dividedBy(oneHundredMillion).toNumber(),
      nonce: values.nonce,
      protocol: 'ALEX',
      router: router
        .map(x => createSwapAssetFromAlexCurrency(supportedCurrencies.find(y => y.id === x)))
        .filter(isDefined),
      slippage,
      sponsored: isSponsoredByAlex,
      swapAmountFrom: values.swapAmountFrom,
      swapAmountTo: values.swapAmountTo,
      swapAssetFrom: values.swapAssetFrom,
      swapAssetTo: values.swapAssetTo,
      timestamp: new Date().toISOString(),
    });

    navigate(RouteUrls.SwapReview);
  }

  async function onSubmitSwap() {
    if (isUndefined(currentAccount) || isUndefined(swapSubmissionData)) {
      logger.error('Error submitting swap data to sign');
      return;
    }

    if (
      isUndefined(swapSubmissionData.swapAssetFrom) ||
      isUndefined(swapSubmissionData.swapAssetTo)
    ) {
      logger.error('No assets selected to perform swap');
      return;
    }

    setIsLoading();

    const fromAmount = BigInt(
      new BigNumber(swapSubmissionData.swapAmountFrom)
        .multipliedBy(oneHundredMillion)
        .dp(0)
        .toString()
    );

    const minToAmount = BigInt(
      new BigNumber(swapSubmissionData.swapAmountTo)
        .multipliedBy(oneHundredMillion)
        .multipliedBy(1 - slippage)
        .dp(0)
        .toString()
    );

    const tx = alexSDK.runSwap(
      currentAccount?.address,
      swapSubmissionData.swapAssetFrom.currency,
      swapSubmissionData.swapAssetTo.currency,
      fromAmount,
      minToAmount,
      swapSubmissionData.router.map(x => x.currency)
    );

    // TODO: Add choose fee step for swaps
    const tempFormValues = {
      fee: swapSubmissionData.fee,
      feeCurrency: swapSubmissionData.feeCurrency,
      feeType: swapSubmissionData.feeType,
      nonce: swapSubmissionData.nonce,
    };

    const payload: ContractCallPayload = {
      anchorMode: AnchorMode.Any,
      contractAddress: tx.contractAddress,
      contractName: tx.contractName,
      functionName: tx.functionName,
      functionArgs: tx.functionArgs.map(x => bytesToHex(serializeCV(x))),
      postConditionMode: PostConditionMode.Deny,
      postConditions: tx.postConditions.map(pc => bytesToHex(serializePostCondition(pc))),
      publicKey: currentAccount?.stxPublicKey,
      sponsored: swapSubmissionData.sponsored,
      txType: TransactionTypes.ContractCall,
    };

    const unsignedTx = await generateUnsignedTx(payload, tempFormValues);
    if (!unsignedTx) return logger.error('Attempted to generate unsigned tx, but tx is undefined');

    const signedTx = signSoftwareWalletTx(unsignedTx);
    if (!signedTx) return logger.error('Attempted to generate raw tx, but signed tx is undefined');
    const txRaw = bytesToHex(signedTx.serialize());

    if (isSponsoredByAlex) {
      return await broadcastAlexSwap(txRaw);
    }
    return await broadcastStacksSwap(unsignedTx);
  }

  const swapContextValue: SwapContext = {
    fetchToAmount,
    isSendingMax,
    onSetIsSendingMax: value => setIsSendingMax(value),
    onSubmitSwapForReview,
    onSubmitSwap,
    swappableAssetsFrom: migratePositiveBalancesToTop(swappableAssets),
    swappableAssetsTo: swappableAssets,
    swapSubmissionData,
  };

  return (
    <SwapProvider value={swapContextValue}>
      <SwapContainerLayout>
        <SwapForm>
          <NonceSetter />
          <Outlet />
        </SwapForm>
      </SwapContainerLayout>
    </SwapProvider>
  );
}
