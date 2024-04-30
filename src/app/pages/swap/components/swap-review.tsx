import { Outlet } from 'react-router-dom';

import { SwapSelectors } from '@tests/selectors/swap.selectors';

import { LoadingKeys, useLoading } from '@app/common/hooks/use-loading';
import { Button } from '@app/ui/components/button/button';
import { Footer } from '@app/ui/components/containers/footers/footer';
import { Card } from '@app/ui/layout/card/card';
import { CardContent } from '@app/ui/layout/card/card-content';

import { useSwapContext } from '../swap.context';
import { SwapAssetsPair } from './swap-assets-pair/swap-assets-pair';
import { SwapDetails } from './swap-details/swap-details';

export function SwapReview() {
  const { onSubmitSwap } = useSwapContext();
  const { isLoading } = useLoading(LoadingKeys.SUBMIT_SWAP_TRANSACTION);

  return (
    <>
      <Card
        footer={
          <Footer variant="card">
            <Button
              aria-busy={isLoading}
              data-testid={SwapSelectors.SwapSubmitBtn}
              type="button"
              onClick={onSubmitSwap}
              fullWidth
            >
              Swap
            </Button>
          </Footer>
        }
      >
        <CardContent dataTestId={SwapSelectors.SwapPageReady}>
          <SwapAssetsPair />
          <SwapDetails />
        </CardContent>
      </Card>
      <Outlet />
    </>
  );
}
