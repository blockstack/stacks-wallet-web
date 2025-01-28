import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

import { WALLET_ENVIRONMENT } from '@shared/environment';

export function useInitPushNotifications() {
  useEffect(() => {
    void OneSignal.init({
      appId: 'YOUR_APP_ID',
      notifyButton: {
        enable: true,
      },
      allowLocalhostAsSecureOrigin: WALLET_ENVIRONMENT === 'development',
    });
  }, []);
}
