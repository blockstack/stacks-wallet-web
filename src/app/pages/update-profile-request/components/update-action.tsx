import { useCallback, useState } from 'react';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useCurrentAccount } from '@app/store/accounts/account.hooks';
import { useProfileUpdateRequestSearchParams } from '@app/store/profiles/requests.hooks';
import { useWalletState } from '@app/store/wallet/wallet.hooks';
import { finalizeProfileUpdate } from '@shared/actions/finalize-profile-update';
import { gaiaUrl } from '@shared/constants';
import { Profile, PublicPersonProfile } from '@stacks/profile';
import { createFetchFn } from '@stacks/network';
import {
  DEFAULT_PROFILE,
  fetchAccountProfileUrl,
  fetchProfileFromUrl,
  signAndUploadProfile,
  Profile as WalletSdkProfile,
} from '@stacks/wallet-sdk';
import { UpdateActionLayout } from './update-action.layout';
import { ProfileUpdatePayload } from '@stacks/connect';

function useUpdateProfileSoftwareWallet() {
  const account = useCurrentAccount();
  const wallet = useWalletState();

  return useCallback(
    async (publicProfile: PublicPersonProfile) => {
      const fetchFn = createFetchFn();

      if (!account || account.type === 'ledger' || !wallet) return null;

      const response = await fetchFn(`${gaiaUrl}/hub_info`);
      const { read_url_prefix }: { read_url_prefix: string } = await response.json();
      const profileUrl = await fetchAccountProfileUrl({
        account,
        gaiaHubUrl: read_url_prefix,
      });
      const profile = (await fetchProfileFromUrl(profileUrl, fetchFn)) || DEFAULT_PROFILE;
      const updatedProfile = {
        ...profile,
        ...(publicProfile as PublicPersonProfile),
        // apps and appsMeta must not be overwritten by user
        apps: profile.apps,
        appsMeta: profile.appsMeta,
      };
      await signAndUploadProfile({
        profile: updatedProfile as unknown as WalletSdkProfile,
        account,
        gaiaHubUrl: gaiaUrl,
      });
      return updatedProfile;
    },
    [account, wallet]
  );
}

export function UpdateAction({
  profileUpdaterPayload,
}: {
  profileUpdaterPayload: ProfileUpdatePayload;
}): JSX.Element | null {
  const { profile: publicProfile } = profileUpdaterPayload;

  const { tabId, requestToken } = useProfileUpdateRequestSearchParams();
  const updateProfileSofwareWallet = useUpdateProfileSoftwareWallet();
  const [isLoading, setIsLoading] = useState(false);
  const analytics = useAnalytics();

  if (!requestToken || !tabId) return null;

  const onUpdateProfile = async () => {
    setIsLoading(true);
    void analytics.track('request_update_profile_submit');
    const result = await updateProfileSofwareWallet(publicProfile);
    setIsLoading(false);

    finalizeProfileUpdate({
      requestPayload: requestToken,
      tabId,
      data: result === null ? 'cancel' : result, // result is null for hardware wallets
    });
  };

  const onCancel = async () => {
    void analytics.track('request_update_profile_cancel');
    finalizeProfileUpdate({ requestPayload: requestToken, tabId, data: 'cancel' });
  };

  return (
    <UpdateActionLayout
      onUpdateProfile={onUpdateProfile}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
}
