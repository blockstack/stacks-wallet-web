import { memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useClipboard } from '@stacks/ui';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useDefaultWalletSecretKey } from '@app/store/in-memory-key/in-memory-key.selectors';
import { SecretKeyDisplayerLayout } from './secret-key-displayer.layout';
import { RouteUrls } from '@shared/route-urls';
import { useGeneratedSecretKey } from '@app/store/keys/key.selectors';

export const SecretKeyDisplayer = memo(() => {
  const tmpSecretKey = useGeneratedSecretKey();
  const defaultWalletSecretKey = useDefaultWalletSecretKey();
  const secretKey = defaultWalletSecretKey ?? tmpSecretKey;
  const { onCopy, hasCopied } = useClipboard(secretKey || '');
  const { pathname } = useLocation();
  const analytics = useAnalytics();

  const copyToClipboard = () => {
    void analytics.track('copy_secret_key_to_clipboard');
    onCopy();
  };

  const secretKeyWords = useMemo(() => secretKey?.split(' '), [secretKey]);
  const showTitleAndIllustration = pathname === RouteUrls.BackUpSecretKey;

  return (
    <SecretKeyDisplayerLayout
      hasCopied={hasCopied}
      onCopyToClipboard={copyToClipboard}
      secretKeyWords={secretKeyWords}
      showTitleAndIllustration={showTitleAndIllustration}
    />
  );
});
