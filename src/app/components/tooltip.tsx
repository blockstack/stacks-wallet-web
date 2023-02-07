import { memo, useMemo } from 'react';

import { Box, BoxProps } from '@stacks/ui';
import Tippy, { TippyProps } from '@tippyjs/react';

interface TooltipProps extends TippyProps {
  label?: TippyProps['content'];
  labelProps?: BoxProps;
  hideOnClick?: boolean;
}
export const Tooltip = memo(({ label, labelProps = {}, hideOnClick, children, ...rest }: TooltipProps) => {
  const content = useMemo(
    () => (
      <Box as="span" display="block" fontSize={0} {...labelProps}>
        {label}
      </Box>
    ),
    [labelProps, label]
  );
  if (!label) return <>{children}</>;
  return (
    <Tippy content={content} trigger="mouseenter" hideOnClick={hideOnClick} {...rest}>
      {children}
    </Tippy>
  );
});
