import { useMemo } from 'react';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';

import { getStacksAppVersion } from '../utils/stacks-ledger-utils';

export function useLedgerAnalytics() {
  const analytics = useAnalytics();
  return useMemo(
    () => ({
      trackDeviceVersionInfo(info: Awaited<ReturnType<typeof getStacksAppVersion>>) {
        void analytics.track('ledger_app_version_info', info);
      },
      transactionSignedOnLedgerSuccessfully() {
        void analytics.track('ledger_transaction_signed_approved');
      },
      transactionSignedOnLedgerRejected() {
        void analytics.track('ledger_transaction_signed_rejected');
      },
      messageSignedOnLedgerSuccessfully() {
        void analytics.track('ledger_message_signed_approved');
      },
      messageSignedOnLedgerRejected() {
        void analytics.track('ledger_message_signed_rejected');
      },
      publicKeysPulledFromLedgerSuccessfully() {
        void analytics.track('ledger_public_keys_pulled_from_device');
      },
    }),
    [analytics]
  );
}
