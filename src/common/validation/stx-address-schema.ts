import * as yup from 'yup';
import { validateAddressChain, validateStacksAddress } from '@common/stacks-utils';
import { isString } from '@common/utils';
import { Network } from '@common/constants';

export function stxAddressNetworkValidatorFactory(currentNetwork: Network) {
  return (value: unknown) => {
    if (!isString(value)) return false;
    return validateAddressChain(value, currentNetwork);
  };
}

export function stxNotCurrentAddressValidatorFactory(currentAddress: string) {
  return (value: unknown) => value !== currentAddress;
}

export function stxAddressSchema(errorMsg: string) {
  return yup.string().test({
    message: errorMsg,
    test(value: unknown) {
      if (!isString(value)) return false;
      return validateStacksAddress(value);
    },
  });
}

export function stxNonceSchema() {
  return yup
    .number()
    .required('Is required')
    .typeError('you must specify a number')
    .min(0, 'Min value 0.')
    .positive('Must be positive.')
    .integer('Must be an integer')
}
