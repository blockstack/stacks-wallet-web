import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

import { useClipboard } from '@stacks/ui';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useBackgroundLocationRedirect } from '@app/routes/hooks/use-background-location-redirect';

import { ReceiveBtcModalWarning } from './components/receive-btc-warning';
import { ReceiveTokensLayout } from './components/receive-tokens.layout';

export function ReceiveOrdinalModal() {
  useBackgroundLocationRedirect();
  const analytics = useAnalytics();
  const { state } = useLocation();
  const { onCopy } = useClipboard(state?.btcAddressTaproot);

  function copyToClipboard() {
    void analytics.track('copy_address_to_add_new_inscription');
    toast.success('Copied to clipboard!');
    onCopy();
  }

  return (
    <ReceiveTokensLayout
      address={state.btcAddressTaproot}
      onCopyAddressToClipboard={copyToClipboard}
      title="ORD. INSCRIPTION"
      warning={<ReceiveBtcModalWarning message="Deposit only Ordinal inscriptions here" />}
    />
  );
}
