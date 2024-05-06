import { useEffect } from 'react';

import { useStampsByAddress } from '@leather-wallet/query';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useCurrentAccountNativeSegwitAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { Stamp } from './stamp';

export function Stamps() {
  const currentAccountBtcAddress = useCurrentAccountNativeSegwitAddressIndexZero();
  const { data: stamps = [] } = useStampsByAddress(currentAccountBtcAddress);
  const analytics = useAnalytics();

  useEffect(() => {
    if (!stamps.length) return;
    if (stamps.length > 0) {
      void analytics.track('view_collectibles', {
        stamps_count: stamps.length,
      });
      void analytics.identify({ stamps_count: stamps.length });
    }
  }, [analytics, stamps]);

  if (!stamps.length) return null;

  return (
    <>
      {stamps.map(s => (
        <Stamp bitcoinStamp={s} key={s.tx_hash} />
      ))}
    </>
  );
}
