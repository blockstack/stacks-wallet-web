import React, { memo } from 'react';
import { Stack, StackProps, color } from '@stacks/ui';
import { HiroIcon } from './icons/hiro-icon';
import { HiroWallet } from './icons/hiro-wallet';

export const HiroWalletLogo: React.FC<StackProps> = memo(props => {
  return (
    <Stack
      color={color('text-title')}
      cursor="pointer"
      flexDirection="row"
      isInline
      alignItems="center"
      _hover={{ color: color('brand') }}
      {...props}
    >
      <HiroIcon width="28px" height="20px" />
      <HiroWallet width="82px" height="14px" />
    </Stack>
  );
});
