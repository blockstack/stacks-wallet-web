import { useState } from 'react';

import { css } from 'leather-styles/css';

import { Eye1ClosedIcon } from '@leather.io/ui';

interface Src20ImageProps {
  alt?: string;
  src: string;
}
export function Src20Image(props: Src20ImageProps) {
  const { alt, src } = props;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [width, setWidth] = useState(0);

  if (isError) return <Eye1ClosedIcon />;

  return (
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
      className={css({
        width: 'xl',
        aspectRatio: '1 / 1',
        borderRadius: '100%',
        objectFit: 'cover',
        // display: 'none' breaks onLoad event firing
        opacity: isLoading ? '0' : '1',
        imageRendering: width <= 40 ? 'pixelated' : 'auto',
      })}
    />
  );
}
