import { DEFAULT_FEE } from '@common/constants';
import { useFetchFeeRate } from '@common/hooks/use-fetch-fee-rate';

export function useFeeWithDefault() {
  const fee = useFetchFeeRate();
  return fee ?? DEFAULT_FEE;
}
