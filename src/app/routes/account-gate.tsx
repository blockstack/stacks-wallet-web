import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { RouteUrls } from '@shared/route-urls';

import { useDefaultWalletSecretKey } from '@app/store/in-memory-key/in-memory-key.selectors';
import { useCurrentKeyDetails } from '@app/store/keys/key.selectors';

export function shouldNavigateToOnboardingStartPage(currentKeyDetails?: any) {
  return !currentKeyDetails;
}

export function shouldNavigateToUnlockWalletPage(currentInMemorySecretKey?: string) {
  return !currentInMemorySecretKey;
}

interface AccountGateProps {
  children?: ReactNode;
}
export function AccountGate({ children }: AccountGateProps) {
  const currentKeyDetails = useCurrentKeyDetails();
  const currentInMemorySecretKey = useDefaultWalletSecretKey();

  // console.log('currentKeyDetails', currentKeyDetails);
  // console.log('currentInMemorySecretKey', currentInMemorySecretKey);

  if (currentKeyDetails?.type === 'ledger') return <>{children}</>;

  if (shouldNavigateToOnboardingStartPage(currentKeyDetails))
    return <Navigate to={RouteUrls.Onboarding} />;

  if (shouldNavigateToUnlockWalletPage(currentInMemorySecretKey))
    return <Navigate to={RouteUrls.Unlock} />;

  return <>{children}</>;
}
