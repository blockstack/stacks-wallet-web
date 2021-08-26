import { Box, Text } from '@stacks/ui';
import { FieldHookConfig } from 'formik';
import { currentAccountNonceState, overrideNonceFormState } from '@store/accounts/nonce';
import { currentAccountStxAddressState } from '@store/accounts';
import { Input } from '@stacks/ui';
import { useAtomValue } from 'jotai/utils';
import { ErrorLabel } from '@components/error-label';
import React, { useEffect } from 'react';
import { BigNumber } from 'bignumber.js';
import { useAtom } from 'jotai';
import { Formik, Form, useField } from 'formik';
import * as yup from 'yup';
import { nonceSchema } from '@common/validation/nonce-schema';
import { MAX_LENGTH_BIG_NUMBER } from '@common/constants';

const NonceFieldOverride = ({ ...props }) => {
  const [field, meta] = useField(props as FieldHookConfig<number>);
  const { error } = meta;
  const { onChange } = field;

  const address = useAtomValue(currentAccountStxAddressState);
  if (!address) return null;
  const correctNonce = useAtomValue(currentAccountNonceState);
  const [nonceOverride, setNonceOverride] = useAtom(overrideNonceFormState);

  useEffect(() => {
    setNonceOverride(correctNonce);
  }, [correctNonce, setNonceOverride]);

  const handleChange = async (e: React.ChangeEvent<any>) => {
    const { value } = e.target;
    if (value.length >= MAX_LENGTH_BIG_NUMBER) return;
    const nonce = new BigNumber(value, 10);
    setNonceOverride(nonce.isInteger() ? nonce.toNumber() : undefined);
    return onChange(e);
  };

  return (
    <>
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
          onChange={handleChange}
          value={nonceOverride || ''}
          autoComplete="off"
          name="nonce"
        />
      </Box>
      {error && (
        <ErrorLabel>
          <Text textStyle="caption">{error}</Text>
        </ErrorLabel>
      )}
    </>
  );
};

export const TxSettings: React.FC = () => {
  const validationSchema = yup.object({
    nonce: nonceSchema(),
  });

  return (
    <Formik initialValues={{ nonce: 0 }} validationSchema={validationSchema} onSubmit={() => {}}>
      <Form>
        <NonceFieldOverride label="nonce" name="nonce" type="text" />
      </Form>
    </Formik>
  );
};
