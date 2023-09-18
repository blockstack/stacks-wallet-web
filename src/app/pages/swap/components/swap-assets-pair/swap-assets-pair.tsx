import { useNavigate } from 'react-router-dom';

import { useFormikContext } from 'formik';

import { RouteUrls } from '@shared/route-urls';
import { isUndefined } from '@shared/utils';

import { SwapFormValues } from '../../hooks/use-swap';
import { SwapAssetItemLayout } from './swap-asset-item.layout';
import { SwapAssetsPairLayout } from './swap-assets-pair.layout';

export function SwapAssetsPair() {
  const { values } = useFormikContext<SwapFormValues>();
  const { swapAmountFrom, swapAmountTo, swapAssetFrom, swapAssetTo } = values;
  const navigate = useNavigate();

  if (isUndefined(swapAssetFrom) || isUndefined(swapAssetTo)) {
    navigate(RouteUrls.Swap, { replace: true });
    return null;
  }

  return (
    <SwapAssetsPairLayout
      swapAssetFrom={
        <SwapAssetItemLayout
          icon={swapAssetFrom.icon}
          symbol={swapAssetFrom.balance.symbol}
          value={swapAmountFrom}
        />
      }
      swapAssetTo={
        <SwapAssetItemLayout
          icon={swapAssetTo.icon}
          symbol={swapAssetTo.balance.symbol}
          value={swapAmountTo}
        />
      }
    />
  );
}
