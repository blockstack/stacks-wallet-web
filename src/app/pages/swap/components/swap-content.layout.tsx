import { SwapCryptoAssetSelectors } from '@tests/selectors/swap.selectors';
import { Flex } from 'leather-styles/jsx';

import { HasChildren } from '@app/common/has-children';

export function SwapContentLayout({ children }: HasChildren) {
  return (
    <Flex
      alignItems="center"
      data-testid={SwapCryptoAssetSelectors.SwapPageReady}
      flexDirection="column"
      maxHeight={['calc(100vh - 116px)', 'calc(85vh - 116px)']}
      overflowY="auto"
      pb={['120px', '48px']}
      pt={['space.04', '48px']}
      px="space.05"
      width="100%"
    >
      {children}
    </Flex>
  );
}
