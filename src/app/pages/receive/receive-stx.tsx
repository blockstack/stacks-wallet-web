import toast from 'react-hot-toast';

import { useClipboard } from '@stacks/ui';

import { useCurrentAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { ReceiveTokensLayout } from './components/receive-tokens.layout';

export function ReceiveStxModal() {
  const currentAccount = useCurrentStacksAccount();
  const analytics = useAnalytics();
  const { onCopy } = useClipboard(currentAccount?.address ?? '');
  const accountName = useCurrentAccountDisplayName();

  function copyToClipboard() {
    void analytics.track('copy_stx_address_to_clipboard');
    toast.success('Copied to clipboard');
    onCopy();
  }

  if (!currentAccount) return null;

  return (
    <ReceiveTokensLayout
      address={currentAccount.address}
      accountName={accountName}
      onCopyAddressToClipboard={copyToClipboard}
      title="STX"
    />
  );
}
