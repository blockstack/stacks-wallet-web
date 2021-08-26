import { Box, Text, StackProps, Stack } from '@stacks/ui';
import { useFormikContext } from 'formik';
import { Input, InputGroup } from '@stacks/ui';
import { ErrorLabel } from '@components/error-label';
import React, { memo } from 'react';
import { BigNumber } from 'bignumber.js';
import { MAX_LENGTH_BIG_NUMBER } from '@common/constants';

interface NonceFieldProps extends StackProps {
  value: number;
  error?: string;
}

export const NonceField = memo((props: NonceFieldProps) => {
  const { value, error, ...rest } = props;
  const { setFieldValue, handleChange } = useFormikContext();

  const onChange = (e: React.ChangeEvent<any>) => {
    const { value } = e.target;
    if (value.length >= MAX_LENGTH_BIG_NUMBER) return;
    let nonce;
    try {
      nonce = new BigNumber(value, 10);
    } catch (e) {
      // BN will throw an exception if not an integer, we keep the last value in that case
      return;
    }
    setFieldValue('nonce', nonce.toNumber());
    return handleChange(e);
  };

  return (
    <Stack {...rest}>
      <InputGroup flexDirection="column">
        <Text as="label" display="block" mb="tight" fontSize={1} fontWeight="500" htmlFor="amount">
          Nonce
        </Text>
        <Box position="relative">
          <Input
            display="block"
            type="text"
            inputMode="numeric"
            maxLength={MAX_LENGTH_BIG_NUMBER}
            width="100%"
            min="0"
            onChange={onChange}
            value={value}
            autoComplete="off"
            name="nonce"
          />
        </Box>
      </InputGroup>
      {error && (
        <ErrorLabel>
          <Text textStyle="caption">{error}</Text>
        </ErrorLabel>
      )}
    </Stack>
  );
});
