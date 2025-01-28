import { SwapSelectors } from '@tests/selectors/swap.selectors';
import { Stack } from 'leather-styles/jsx';

import type { SwapAsset } from '@leather.io/query';

import { SwapAssetItem } from './swap-asset-item';
import { useSwapAssetList } from './use-swap-asset-list';

export interface SwapAssetListProps {
  assets: SwapAsset[];
  type: string;
}
export function SwapAssetList({ assets, type }: SwapAssetListProps) {
  const { selectableAssets, onSelectAsset } = useSwapAssetList({ assets, type });

  return (
    <Stack mb="space.05" p="space.05" width="100%" data-testid={SwapSelectors.SwapAssetList}>
      {selectableAssets.map((asset, idx) => (
        <SwapAssetItem
          asset={asset}
          key={`${asset.tokenId}${idx}`}
          onClick={() => onSelectAsset(asset)}
        />
      ))}
    </Stack>
  );
}
