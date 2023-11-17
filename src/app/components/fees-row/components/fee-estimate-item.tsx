import { useMemo } from 'react';

import { HStack, styled } from 'leather-styles/jsx';

import { LeatherButton } from '@app/ui/components/button';
import { CheckmarkIcon } from '@app/ui/components/icons/checkmark-icon';
import { ChevronDownIcon } from '@app/ui/components/icons/chevron-down-icon';

const labels = ['Low', 'Standard', 'High', 'Custom'];
const testLabels = labels.map(label => label.toLowerCase());

interface FeeEstimateItemProps {
  index: number;
  isVisible?: boolean;
  onSelectItem(index: number): void;
  selectedItem: number;
  disableFeeSelection?: boolean;
}
export function FeeEstimateItem({
  index,
  isVisible,
  onSelectItem,
  selectedItem,
  disableFeeSelection,
}: FeeEstimateItemProps) {
  const selectedIcon = useMemo(() => {
    const isSelected = index === selectedItem;
    return isSelected ? <CheckmarkIcon /> : <></>;
  }, [index, selectedItem]);

  return (
    <LeatherButton
      _hover={{
        bg: isVisible ? 'accent.component-background-hover' : 'accent.background-primary',
        borderRadius: '8px',
        color: 'accent.text-primary',
      }}
      alignItems="center"
      data-testid={`${testLabels[index]}-fee`}
      display="flex"
      height="30px"
      minWidth="100px"
      onClick={() => !disableFeeSelection && onSelectItem(index)}
      pl={isVisible ? 'space.02' : 'unset'}
      variant="text"
    >
      <HStack gap="space.01">
        <styled.span textStyle="label.02">{labels[index]}</styled.span>
        {!disableFeeSelection && (isVisible ? selectedIcon : <ChevronDownIcon />)}
      </HStack>
    </LeatherButton>
  );
}
