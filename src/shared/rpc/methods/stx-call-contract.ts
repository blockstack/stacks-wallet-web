import { stxCallContractRequestParamsSchema } from '@leather.io/rpc';

import { formatValidationErrors, getRpcParamErrors, validateRpcParams } from './validation.utils';

export function validateRpcStxCallContractParams(obj: unknown) {
  return validateRpcParams(obj, stxCallContractRequestParamsSchema);
}

export function getRpcStxCallContractParamErrors(obj: unknown) {
  return formatValidationErrors(getRpcParamErrors(obj, stxCallContractRequestParamsSchema));
}
