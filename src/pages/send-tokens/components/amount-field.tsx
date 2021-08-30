import React, { memo } from 'react';
import { Box, Input, InputGroup, Stack, StackProps, Text } from '@stacks/ui';
import { useFormikContext } from 'formik';
import { useAssets } from '@store/assets/asset.hooks';
import { useSelectedAsset } from '@common/hooks/use-selected-asset';
import { ErrorLabel } from '@components/error-label';

import { useSendAmountFieldActions } from '../hooks/use-send-form';
import { SendMaxWithSuspense } from './send-max-button';
import { SendFormSelectors } from '@tests/page-objects/send-form.selectors';
import { useCurrentAccountBalancesUnanchoredState } from '@store/accounts/account.hooks';

interface AmountFieldProps extends StackProps {
  value: number;
  error?: string;
}

// TODO: this should use a new "Field" component (with inline label like in figma)
export const AmountField = memo((props: AmountFieldProps) => {
  const { value, error, ...rest } = props;

  const assets = useAssets();
  const balances = useCurrentAccountBalancesUnanchoredState();
  const { selectedAsset, placeholder } = useSelectedAsset();
  const { setFieldValue, handleChange } = useFormikContext();
  const { handleOnKeyDown, handleSetSendMax } = useSendAmountFieldActions({
    setFieldValue,
  });

  return (
    <Stack {...rest}>
      <InputGroup flexDirection="column">
        <Text as="label" display="block" mb="tight" fontSize={1} fontWeight="500" htmlFor="amount">
          Amount
        </Text>
        <Box position="relative">
          <Input
            display="block"
            type="text"
            inputMode="numeric"
            width="100%"
            placeholder={placeholder || 'Select an asset first'}
            min="0"
            autoFocus={assets?.length === 1}
            value={value === 0 ? '' : value}
            onKeyDown={handleOnKeyDown}
            onChange={handleChange}
            autoComplete="off"
            name="amount"
            data-testid={SendFormSelectors.InputAmountField}
          />
          {balances && selectedAsset ? (
            <SendMaxWithSuspense
              showButton={Boolean(balances && selectedAsset)}
              onSetMax={fee => handleSetSendMax(fee)}
            />
          ) : null}
        </Box>
      </InputGroup>
      {error && (
        <ErrorLabel data-testid={SendFormSelectors.InputAmountFieldErrorLabel}>
          <Text textStyle="caption">{error}</Text>
        </ErrorLabel>
      )}
    </Stack>
  );
});
