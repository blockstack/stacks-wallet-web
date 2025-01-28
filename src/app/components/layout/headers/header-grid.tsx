import { ChainId } from '@stacks/network';
import { Flex, Grid, GridItem, type GridProps, HStack } from 'leather-styles/jsx';

import { NetworkModeBadge } from '@leather.io/ui';

import type { HasChildren } from '@app/common/has-children';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

interface HeaderGridProps extends GridProps {
  leftCol: React.ReactNode;
  centerCol?: React.ReactNode;
  rightCol: React.ReactNode;
}
export function HeaderGrid({ leftCol, centerCol, rightCol, ...props }: HeaderGridProps) {
  return (
    <Grid
      alignItems="center"
      gridTemplateColumns={centerCol ? '2fr 4fr 2fr' : 'auto auto'}
      gridAutoFlow="column"
      width="100%"
      {...props}
    >
      <GridItem justifySelf="start">
        <Flex py={{ base: 0, md: 'space.01' }}>{leftCol}</Flex>
      </GridItem>
      {centerCol && <GridItem margin="auto">{centerCol}</GridItem>}
      <GridItem>{rightCol}</GridItem>
    </Grid>
  );
}

export function HeaderGridRightCol({ children }: HasChildren) {
  const { chain, name: chainName } = useCurrentNetworkState();
  return (
    <HStack alignItems="center" justifyContent="flex-end">
      <NetworkModeBadge
        isTestnetChain={chain.stacks.chainId === ChainId.Testnet}
        name={chainName}
      />
      {children}
    </HStack>
  );
}
