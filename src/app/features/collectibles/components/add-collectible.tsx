import { useLocation, useNavigate } from 'react-router-dom';

import { PlusIcon } from '@leather-wallet/ui';

import { RouteUrls } from '@shared/route-urls';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';

import { CollectibleItemLayout } from './collectible-item.layout';

export function AddCollectible() {
  const navigate = useNavigate();
  const analytics = useAnalytics();
  const location = useLocation();

  return (
    <CollectibleItemLayout
      onClickLayout={() => {
        void analytics.track('select_add_new_collectible');
        navigate(`${RouteUrls.Home}${RouteUrls.ReceiveCollectible}`, {
          state: {
            backgroundLocation: location,
          },
        });
      }}
      showBorder
      subtitle="Collectible"
      title="Add new"
    >
      <PlusIcon height="auto" width="xl" />
    </CollectibleItemLayout>
  );
}
