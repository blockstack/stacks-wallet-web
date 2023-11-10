import { Box, HStack, styled } from 'leather-styles/jsx';

import { noop } from '@shared/utils';

import { LeatherButton } from '@app/components/button/button';
import { Tooltip } from '@app/components/tooltip';

import { SelectAssetTriggerButton } from './select-asset-trigger-button';
import { SelectedAsset } from './selected-asset';
import { SwapToggleButton } from './swap-toggle-button';

function getTextColor(showError?: boolean, onClickHandler?: boolean) {
  if (showError) return 'error.label';
  if (onClickHandler) return 'accent.text-primary';
  return 'accent.text-subdued';
}

interface SwapSelectedAssetLayoutProps {
  caption?: string;
  error?: string;
  icon?: string;
  name: string;
  onChooseAsset(): void;
  onClickHandler?(): void;
  showError?: boolean;
  showToggle?: boolean;
  swapAmountInput: React.JSX.Element;
  symbol: string;
  title: string;
  tooltipLabel?: string;
  value: string;
}
export function SwapSelectedAssetLayout({
  caption,
  error,
  icon,
  name,
  onChooseAsset,
  onClickHandler,
  showError,
  showToggle,
  swapAmountInput,
  symbol,
  title,
  tooltipLabel,
  value,
}: SwapSelectedAssetLayoutProps) {
  const captionTextColor = getTextColor(showError);

  return (
    <Box width="100%">
      <HStack
        alignItems="center"
        justifyContent="space-between"
        mb="space.02"
        mt={showToggle ? 'space.06' : 'space.04'}
      >
        <styled.span textStyle="label.01">{title}</styled.span>
        {showToggle && <SwapToggleButton />}
      </HStack>
      <SelectedAsset
        contentLeft={
          <SelectAssetTriggerButton
            icon={icon}
            name={name}
            onChooseAsset={onChooseAsset}
            symbol={symbol}
          />
        }
        contentRight={swapAmountInput}
        name={name}
        showError={showError}
      />
      {caption ? (
        <HStack alignItems="center" justifyContent="space-between">
          <Tooltip label={tooltipLabel} maxWidth="160px" placement="bottom">
            <styled.span
              color={captionTextColor}
              cursor={tooltipLabel ? 'pointer' : 'unset'}
              textStyle="caption.02"
            >
              {showError ? error : caption}
            </styled.span>
          </Tooltip>
          <LeatherButton
            _focus={{ _before: { color: 'unset' } }}
            cursor={onClickHandler ? 'pointer' : 'unset'}
            onClick={onClickHandler ? onClickHandler : noop}
            variant={onClickHandler ? 'link' : 'text'}
          >
            <styled.span textStyle="caption.02">{value}</styled.span>
          </LeatherButton>
        </HStack>
      ) : null}
    </Box>
  );
}
