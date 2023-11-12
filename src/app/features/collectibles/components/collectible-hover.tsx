import { Box, styled } from 'leather-styles/jsx';

import { ArrowUpIcon } from '@app/ui/components/icons/arrow-up-icon';

interface CollectibleHoverProps {
  collectibleTypeIcon?: React.JSX.Element;
  isHovered: boolean;
  onClickCallToAction?(): void;
}
export function CollectibleHover({
  collectibleTypeIcon,
  isHovered,
  onClickCallToAction,
}: CollectibleHoverProps) {
  return (
    <Box
      _focusWithin={{ opacity: 'inherit' }}
      display="flex"
      height="100%"
      left="0px"
      opacity="0"
      overflow="hidden"
      position="absolute"
      style={{ opacity: isHovered ? 'inherit' : '0' }}
      top="0px"
      width="100%"
      zIndex={999}
    >
      <Box bottom="space.03" height="30px" left="space.03" position="absolute" width="30px">
        {collectibleTypeIcon}
      </Box>
      {onClickCallToAction && (
        <styled.button
          _focus={{ outline: 'focus' }}
          _hover={{ bg: 'accent.component-background-hover' }}
          alignItems="center"
          bg="accent.background-primary"
          borderRadius="50%"
          display="flex"
          height="30px"
          justifyContent="center"
          onClick={e => {
            e.stopPropagation();
            onClickCallToAction();
          }}
          position="absolute"
          right="12px"
          top="12px"
          width="30px"
        >
          <ArrowUpIcon transform="rotate(45deg)" />
        </styled.button>
      )}
    </Box>
  );
}
