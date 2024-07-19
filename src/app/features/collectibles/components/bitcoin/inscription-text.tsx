import { useGetInscriptionTextContentQuery } from '@leather.io/query';
import { OrdinalAvatarIcon } from '@leather.io/ui';

import { parseJson } from '@app/components/json';

import { CollectibleText } from '../_collectible-types/collectible-text';

interface InscriptionTextProps {
  contentSrc: string;
  inscriptionNumber: number;
  onClickCallToAction(): void;
  onClickSend(): void;
}
export function InscriptionText({
  contentSrc,
  inscriptionNumber,
  onClickCallToAction,
  onClickSend,
}: InscriptionTextProps) {
  const query = useGetInscriptionTextContentQuery(contentSrc);

  if (query.isLoading || query.isError) return null;

  return (
    <CollectibleText
      icon={<OrdinalAvatarIcon size="lg" />}
      key={inscriptionNumber}
      onClickCallToAction={onClickCallToAction}
      onClickSend={onClickSend}
      content={parseJson(query.data)}
      subtitle="Ordinal inscription"
      title={`# ${inscriptionNumber}`}
    />
  );
}
