import { useMemo } from 'react';

import { cvToValue, hexToCV } from '@stacks/transactions';
import BigNumber from 'bignumber.js';
import * as yup from 'yup';

import { BTC_DECIMALS } from '@leather.io/constants';
import { type SwapAsset } from '@leather.io/query';
import {
  convertAmountToBaseUnit,
  convertAmountToFractionalUnit,
  createMoney,
  isUndefined,
} from '@leather.io/utils';

import { FormErrorMessages } from '@shared/error-messages';
import { type SwapFormValues } from '@shared/models/form.model';

import {
  defaultSbtcLimits,
  useGetCurrentSbtcSupply,
  useGetSbtcLimits,
} from '@app/query/sbtc/sbtc-limits.query';

import { type BaseSwapContext, useSwapContext } from '../swap.context';

export function useSwapForm<T extends BaseSwapContext<T>>() {
  const { isCrossChainSwap, isFetchingExchangeRate } = useSwapContext<T>();
  const { data: sBtcLimits } = useGetSbtcLimits();
  const { data: supply } = useGetCurrentSbtcSupply();

  const remainingSbtcPegCapSupply = useMemo(() => {
    const sBtcPegCap = sBtcLimits?.pegCap;
    if (!sBtcPegCap || !supply) return;
    const currentSupplyValue = supply?.result && cvToValue(hexToCV(supply?.result));
    return convertAmountToFractionalUnit(
      createMoney(
        new BigNumber(Number(sBtcPegCap - currentSupplyValue?.value)),
        'BTC',
        BTC_DECIMALS
      )
    );
  }, [sBtcLimits?.pegCap, supply]);

  const sBtcDepositCapMin = createMoney(
    new BigNumber(sBtcLimits?.perDepositMinimum ?? defaultSbtcLimits.perDepositMinimum),
    'BTC'
  );
  const sBtcDepositCapMax = createMoney(
    new BigNumber(sBtcLimits?.perDepositCap ?? defaultSbtcLimits.perDepositCap),
    'BTC'
  );

  const initialValues: SwapFormValues = {
    fee: '0',
    feeCurrency: '',
    feeType: '',
    nonce: 0,
    swapAmountBase: '',
    swapAmountQuote: '',
    swapAssetBase: undefined,
    swapAssetQuote: undefined,
  };

  const validationSchema = yup.object({
    swapAssetBase: yup.object<SwapAsset>().required(),
    swapAssetQuote: yup.object<SwapAsset>().required(),
    swapAmountBase: yup
      .number()
      .test({
        message: 'Insufficient balance',
        test(value) {
          if (isFetchingExchangeRate) return true;
          const { swapAssetBase } = this.parent;
          const valueInFractionalUnit = convertAmountToFractionalUnit(
            createMoney(
              new BigNumber(Number(value)),
              swapAssetBase.balance.symbol,
              swapAssetBase.balance.decimals
            )
          );
          if (swapAssetBase.balance.amount.isLessThan(valueInFractionalUnit)) return false;
          return true;
        },
      })
      .test({
        message: 'Decimal precision not supported',
        test(value) {
          if (!value || isFetchingExchangeRate) return true;
          const { swapAssetBase } = this.parent;
          const numStr = value.toString();
          if (numStr.includes('e')) {
            const exponent = Math.abs(parseInt(value.toExponential().split('e')[1], 10));
            if (exponent > swapAssetBase.balance.decimals) return false;
          }
          return true;
        },
      })
      .test({
        message: 'sBTC bridge temporarily disabled',
        test() {
          if (!isCrossChainSwap) return true;
          if (isUndefined(sBtcLimits)) return false;
          return true;
        },
      })
      .test({
        message: `Min amount is ${convertAmountToBaseUnit(sBtcDepositCapMin).toString()} BTC`,
        test(value) {
          if (!isCrossChainSwap) return true;
          const { swapAssetBase } = this.parent;
          const valueInFractionalUnit = convertAmountToFractionalUnit(
            createMoney(
              new BigNumber(Number(value)),
              swapAssetBase.balance.symbol,
              swapAssetBase.balance.decimals
            )
          );
          if (valueInFractionalUnit.isLessThan(sBtcDepositCapMin.amount)) return false;
          return true;
        },
      })
      .test({
        message: `Max amount is ${convertAmountToBaseUnit(sBtcDepositCapMax).toString()} BTC`,
        test(value) {
          if (!isCrossChainSwap) return true;
          const { swapAssetBase } = this.parent;
          const valueInFractionalUnit = convertAmountToFractionalUnit(
            createMoney(
              new BigNumber(Number(value)),
              swapAssetBase.balance.symbol,
              swapAssetBase.balance.decimals
            )
          );
          if (valueInFractionalUnit.isGreaterThan(sBtcDepositCapMax.amount)) return false;
          return true;
        },
      })
      .test({
        message: 'Amount exceeds capped supply',
        test(value) {
          if (!isCrossChainSwap) return true;
          const { swapAssetBase } = this.parent;
          const valueInFractionalUnit = convertAmountToFractionalUnit(
            createMoney(
              new BigNumber(Number(value)),
              swapAssetBase.balance.symbol,
              swapAssetBase.balance.decimals
            )
          );
          if (
            !remainingSbtcPegCapSupply ||
            valueInFractionalUnit.isGreaterThan(remainingSbtcPegCapSupply)
          )
            return false;
          return true;
        },
      })
      .required(FormErrorMessages.AmountRequired)
      .typeError(FormErrorMessages.MustBeNumber)
      .positive(FormErrorMessages.MustBePositive),
    swapAmountQuote: yup
      .number()
      .required(FormErrorMessages.AmountRequired)
      .typeError(FormErrorMessages.MustBeNumber)
      .positive(FormErrorMessages.MustBePositive),
  });

  return {
    initialValues,
    validationSchema,
  };
}
