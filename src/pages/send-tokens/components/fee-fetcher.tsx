import { useFeeWithDefault } from '../hooks/use-fee-with-default';

interface FeeFetcherProps {
  children(fee: number): JSX.Element;
}
export function FeeFetcher({ children }: FeeFetcherProps) {
  const fee = useFeeWithDefault();
  return children(fee);
}
