import { memo } from 'react';
import { Text, Stack, StackProps } from '@stacks/ui';

import { Caption } from '@app/components/typography';
import { useSelectedAsset } from '@app/pages/send-tokens/hooks/use-selected-asset';

import { SelectedAssetItem } from './selected-asset-item';

interface SelectedAssetProps extends StackProps {
  hideArrow?: boolean;
  onClearSearch(): void;
}
export const SelectedAsset = memo(({ hideArrow, onClearSearch, ...rest }: SelectedAssetProps) => {
  const { balance, selectedAsset, ticker } = useSelectedAsset();

  if (!selectedAsset) return null;

  return (
    <Stack spacing="base-loose" flexDirection="column" {...rest}>
      <Stack spacing="tight">
        <Text display="block" fontSize={1} fontWeight="500" mb="tight">
          Choose an asset
        </Text>
        <SelectedAssetItem hideArrow={hideArrow} onClearSearch={onClearSearch} />
      </Stack>
      {balance && (
        <Caption>
          Balance: {balance} {ticker}
        </Caption>
      )}
    </Stack>
  );
});
