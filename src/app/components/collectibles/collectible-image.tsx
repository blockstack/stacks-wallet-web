import { ReactNode, useState } from 'react';

import { isValidUrl } from '@shared/utils/validate-url';

import { CollectibleItemLayout, CollectibleItemLayoutProps } from './collectible-item.layout';
import { ImageUnavailable } from './image-unavailable';

interface CollectibleImageProps extends Omit<CollectibleItemLayoutProps, 'children'> {
  alt?: string;
  icon: ReactNode;
  src: string;
}
export function CollectibleImage(props: CollectibleImageProps) {
  const { alt, icon, src, ...rest } = props;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [width, setWidth] = useState(0);
  const isImageAvailable = src && isValidUrl(src);

  return (
    <CollectibleItemLayout collectibleTypeIcon={icon} {...rest}>
      {isError || !isImageAvailable ? (
        <ImageUnavailable />
      ) : (
        <img
          alt={alt}
          onError={() => setIsError(true)}
          loading="lazy"
          onLoad={event => {
            const target = event.target as HTMLImageElement;
            setWidth(target.naturalWidth);
            setIsLoading(false);
          }}
          src={src}
          style={{
            width: '100%',
            height: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            // display: 'none' breaks onLoad event firing
            opacity: isLoading ? '0' : '1',
            imageRendering: width <= 40 ? 'pixelated' : 'auto',
          }}
        />
      )}
    </CollectibleItemLayout>
  );
}
