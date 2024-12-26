import { StacksNonceLoader } from '../loaders/stacks-nonce-loader';
import { StacksSwapProvider } from '../providers/stacks-swap-provider';

export function StacksSwapContainer() {
  return (
    <StacksNonceLoader>
      {nonce => {
        return <StacksSwapProvider nonce={nonce} />;
      }}
    </StacksNonceLoader>
  );
}
