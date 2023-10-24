import { ChangeEvent } from 'react';

import { useField, useFormikContext } from 'formik';
import { Stack, styled } from 'leather-styles/jsx';

import { isDefined, isUndefined } from '@shared/utils';

import { useShowFieldError } from '@app/common/form-utils';

import { SwapFormValues } from '../hooks/use-swap-form';
import { useSwapContext } from '../swap.context';

function getPlaceholderValue(name: string, values: SwapFormValues) {
  if (name === 'swapAmountFrom' && isDefined(values.swapAssetFrom)) return '0';
  if (name === 'swapAmountTo' && isDefined(values.swapAssetTo)) return '0';
  return '-';
}

interface SwapAmountFieldProps {
  amountAsFiat: string;
  isDisabled?: boolean;
  name: string;
}
export function SwapAmountField({ amountAsFiat, isDisabled, name }: SwapAmountFieldProps) {
  const { fetchToAmount, onSetIsSendingMax } = useSwapContext();
  const { setErrors, setFieldValue, values } = useFormikContext<SwapFormValues>();
  const [field] = useField(name);
  const showError = useShowFieldError(name) && name === 'swapAmountFrom' && values.swapAssetTo;

  async function onChange(event: ChangeEvent<HTMLInputElement>) {
    const { swapAssetFrom, swapAssetTo } = values;
    if (isUndefined(swapAssetFrom) || isUndefined(swapAssetTo)) return;
    onSetIsSendingMax(false);
    const value = event.currentTarget.value;
    const toAmount = await fetchToAmount(swapAssetFrom, swapAssetTo, value);
    await setFieldValue('swapAmountTo', Number(toAmount));
    field.onChange(event);
    setErrors({});
  }

  return (
    <Stack alignItems="flex-end" gap="space.01" width="65%">
      <styled.label hidden htmlFor={name}>
        {name}
      </styled.label>
      <styled.input
        _disabled={{
          bg: 'transparent',
          border: 'none',
          color: 'accent.text-subdued',
        }}
        autoComplete="off"
        border="none"
        color={showError ? 'error' : 'accent.text-primary'}
        display="block"
        disabled={isDisabled}
        p="0px"
        placeholder={getPlaceholderValue(name, values)}
        ring="none"
        textAlign="right"
        textStyle="heading.05"
        width="100%"
        {...field}
        onChange={onChange}
      />
      {amountAsFiat ? (
        <styled.span color={showError ? 'error' : 'accent.text-subdued'} textStyle="caption.02">
          {amountAsFiat}
        </styled.span>
      ) : null}
    </Stack>
  );
}
