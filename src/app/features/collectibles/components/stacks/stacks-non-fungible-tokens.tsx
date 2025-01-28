import { Metadata as StacksNftMetadata } from '@hirosystems/token-metadata-api-client';

import { StxAvatarIcon } from '@leather.io/ui';

import { CollectibleImage } from '../../../../components/collectibles/collectible-image';

interface StacksNonFungibleTokensProps {
  metadata: StacksNftMetadata;
}

export function StacksNonFungibleTokens({ metadata }: StacksNonFungibleTokensProps) {
  return (
    <CollectibleImage
      alt="stacks nft"
      icon={<StxAvatarIcon size="lg" />}
      src={metadata.cached_image ?? ''}
      subtitle="Stacks NFT"
      title={metadata.name ?? ''}
    />
  );
}
