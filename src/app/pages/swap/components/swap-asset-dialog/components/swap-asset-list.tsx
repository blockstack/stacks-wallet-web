import { useNavigate, useParams } from 'react-router-dom';

import { SwapSelectors } from '@tests/selectors/swap.selectors';
import BigNumber from 'bignumber.js';
import { useFormikContext } from 'formik';
import { Stack } from 'leather-styles/jsx';

import type { SwapAsset } from '@leather.io/query';
import {
  convertAmountToFractionalUnit,
  createMoney,
  formatMoneyWithoutSymbol,
  isUndefined,
} from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { useSwapContext } from '@app/pages/swap/swap.context';

import { SwapFormValues } from '../../../hooks/use-swap-form';
import { SwapAssetItem } from './swap-asset-item';

interface SwapAssetList {
  assets: SwapAsset[];
  type: string;
}
export function SwapAssetList({ assets, type }: SwapAssetList) {
  const { fetchQuoteAmount } = useSwapContext();
  const { setFieldError, setFieldValue, values } = useFormikContext<SwapFormValues>();
  const navigate = useNavigate();
  const { base, quote } = useParams();
  const isBaseList = type === 'base';
  const isQuoteList = type === 'quote';

  const selectableAssets = assets.filter(
    asset =>
      (isBaseList && asset.name !== values.swapAssetQuote?.name) ||
      (isQuoteList && asset.name !== values.swapAssetBase?.name)
  );

  async function onSelectAsset(asset: SwapAsset) {
    let baseAsset: SwapAsset | undefined;
    let quoteAsset: SwapAsset | undefined;
    if (isBaseList) {
      baseAsset = asset;
      quoteAsset = values.swapAssetQuote;
      await setFieldValue('swapAssetBase', asset);
      navigate(RouteUrls.Swap.replace(':base', baseAsset.name).replace(':quote', quote ?? ''));
    } else if (isQuoteList) {
      baseAsset = values.swapAssetBase;
      quoteAsset = asset;
      await setFieldValue('swapAssetQuote', asset);
      setFieldError('swapAssetQuote', undefined);
      navigate(RouteUrls.Swap.replace(':base', base ?? '').replace(':quote', quoteAsset.name));
    }

    if (baseAsset && quoteAsset && values.swapAmountBase) {
      const quoteAmount = await fetchQuoteAmount(baseAsset, quoteAsset, values.swapAmountBase);
      if (isUndefined(quoteAmount)) {
        await setFieldValue('swapAmountQuote', '');
        return;
      }
      const quoteAmountAsMoney = createMoney(
        convertAmountToFractionalUnit(new BigNumber(quoteAmount), quoteAsset?.balance.decimals),
        quoteAsset?.balance.symbol ?? '',
        quoteAsset?.balance.decimals
      );
      await setFieldValue('swapAmountQuote', formatMoneyWithoutSymbol(quoteAmountAsMoney));
      setFieldError('swapAmountQuote', undefined);
    }
  }

  return (
    <Stack mb="space.05" p="space.05" width="100%" data-testid={SwapSelectors.SwapAssetList}>
      {selectableAssets.map(asset => (
        <SwapAssetItem asset={asset} key={asset.currency} onClick={() => onSelectAsset(asset)} />
      ))}
    </Stack>
  );
}
