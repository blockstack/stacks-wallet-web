import { Currency } from 'alex-sdk';
import BigNumber from 'bignumber.js';
import * as yup from 'yup';

import { FeeTypes } from '@shared/models/fees/fees.model';
import { StacksTransactionFormValues } from '@shared/models/form.model';
import { Money, createMoney } from '@shared/models/money.model';

import { FormErrorMessages } from '@app/common/error-messages';
import { convertAmountToFractionalUnit } from '@app/common/money/calculate-money';
import { useNextNonce } from '@app/query/stacks/nonce/account-nonces.hooks';

export interface SwapAsset {
  balance: Money;
  currency: Currency;
  displayName?: string;
  icon: string;
  name: string;
  price: Money;
  principal: string;
}

export interface SwapFormValues extends StacksTransactionFormValues {
  swapAmountBase: string;
  swapAmountQuote: string;
  swapAssetBase?: SwapAsset;
  swapAssetQuote?: SwapAsset;
}

export function useSwapForm() {
  const { data: nextNonce } = useNextNonce();

  const initialValues: SwapFormValues = {
    fee: '0',
    feeCurrency: 'STX',
    feeType: FeeTypes[FeeTypes.Middle],
    nonce: nextNonce?.nonce,
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
