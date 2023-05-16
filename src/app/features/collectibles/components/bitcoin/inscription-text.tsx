import { Spinner } from '@stacks/ui';

import { figmaTheme } from '@app/common/utils/figma-theme';
import { OrdinalMinimalIcon } from '@app/components/icons/ordinal-minimal-icon';
import { useTextInscriptionContentQuery } from '@app/query/bitcoin/ordinals/use-text-ordinal-content.query';

import { CollectibleText } from '../_collectible-types/collectible-text';

function processContent(content: string) {
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch (e) {
    return content;
  }
}

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
  const query = useTextInscriptionContentQuery(contentSrc);

  if (query.isLoading) return <Spinner color={figmaTheme.icon} size="16px" />;
  if (query.isError) return null;

  return (
    <CollectibleText
      icon={<OrdinalMinimalIcon />}
      key={inscriptionNumber}
      onClickCallToAction={onClickCallToAction}
      onClickSend={onClickSend}
      content={processContent(query.data)}
      subtitle="Ordinal inscription"
      title={`# ${inscriptionNumber}`}
    />
  );
}
