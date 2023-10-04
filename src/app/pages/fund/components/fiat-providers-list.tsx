import { useNavigate } from 'react-router-dom';

import { Grid } from 'leather-styles/jsx';

import { RouteUrls } from '@shared/route-urls';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { LoadingSpinner } from '@app/components/loading-spinner';
import {
  useActiveFiatProviders,
  useHasFiatProviders,
} from '@app/query/common/remote-config/remote-config.query';

import { FiatProviderItem } from './fiat-provider-item';
import { activeFiatProviderIcons, getProviderUrl } from './fiat-providers.utils';
import { ReceiveStxItem } from './receive-stx-item';

interface FiatProvidersProps {
  address: string;
}
export function FiatProvidersList(props: FiatProvidersProps) {
  const { address } = props;
  const navigate = useNavigate();
  const activeProviders = useActiveFiatProviders();
  const hasProviders = useHasFiatProviders();
  const analytics = useAnalytics();

  const goToProviderExternalWebsite = (provider: string, providerUrl: string) => {
    void analytics.track('select_buy_option', { provider });
    openInNewTab(providerUrl);
  };

  if (!hasProviders) return <LoadingSpinner />;

  return (
    <Grid
      columnGap="space.05"
      justifyContent="center"
      mt={['space.04', 'space.08']}
      py="0"
      px="space.08"
      rowGap="1.5rem"
      placeItems="center"
      gridTemplateColumns={[
        'repeat(1, 1fr)',
        'repeat(1, 1fr)',
        'repeat(2, 1fr)',
        'repeat(3, 1fr)',
        'repeat(4, 1fr)',
      ]}
      width="100%"
      maxWidth={['100%', '80rem']}
    >
      <ReceiveStxItem onReceiveStx={() => navigate(RouteUrls.FundReceiveStx)} />
      {Object.entries(activeProviders).map(([providerKey, providerValue]) => {
        const providerUrl = getProviderUrl({
          address,
          hasFastCheckoutProcess: providerValue.hasFastCheckoutProcess,
          key: providerKey,
          name: providerValue.name,
        });

        return (
          <FiatProviderItem
            availableRegions={providerValue.availableRegions}
            hasFastCheckoutProcess={providerValue.hasFastCheckoutProcess}
            hasTradingFees={providerValue.hasTradingFees}
            icon={activeFiatProviderIcons[providerKey]}
            key={providerKey}
            onGoToProvider={() => goToProviderExternalWebsite(providerValue.name, providerUrl)}
            title={providerValue.name}
          />
        );
      })}
    </Grid>
  );
}
