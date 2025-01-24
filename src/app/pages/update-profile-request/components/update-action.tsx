import { useCallback, useState } from 'react';

import { createFetchFn } from '@stacks/common';
import { PublicPersonProfile, PublicProfileBase } from '@stacks/profile';
import {
  DEFAULT_PROFILE,
  fetchAccountProfileUrl,
  fetchProfileFromUrl,
  signAndUploadProfile,
} from '@stacks/wallet-sdk';

import { gaiaUrl } from '@leather.io/constants';

import { finalizeProfileUpdate } from '@shared/actions/finalize-profile-update';
import { analytics } from '@shared/utils/analytics';
import type { ProfileUpdatePayload } from '@shared/utils/legacy-requests';

import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useProfileUpdateRequestSearchParams } from '@app/store/profiles/requests.hooks';

import { UpdateActionLayout } from './update-action.layout';

function useUpdateProfileSoftwareWallet() {
  const account = useCurrentStacksAccount();

  return useCallback(
    async (publicProfile: PublicPersonProfile) => {
      const fetchFn = createFetchFn();

      if (!account || account.type === 'ledger') return null;

      const response = await fetchFn(`${gaiaUrl}/hub_info`);
      const { read_url_prefix }: { read_url_prefix: string } = await response.json();
      const profileUrl = await fetchAccountProfileUrl({
        account,
        gaiaHubUrl: read_url_prefix,
      });
      const profile = (await fetchProfileFromUrl(profileUrl, fetchFn)) || DEFAULT_PROFILE;
      const updatedProfile = {
        ...profile,
        ...publicProfile,
        // apps and appsMeta must not be overwritten by user
        apps: profile.apps,
        appsMeta: profile.appsMeta,
      };
      await signAndUploadProfile({
        profile: updatedProfile as unknown as PublicProfileBase,
        account,
        gaiaHubUrl: gaiaUrl,
      });
      return updatedProfile as PublicPersonProfile;
    },
    [account]
  );
}

export function UpdateAction({
  profileUpdaterPayload,
}: {
  profileUpdaterPayload: ProfileUpdatePayload;
}): React.JSX.Element | null {
  const { profile: publicProfile } = profileUpdaterPayload;

  const { tabId, requestToken } = useProfileUpdateRequestSearchParams();
  const updateProfileSoftwareWallet = useUpdateProfileSoftwareWallet();
  const [isLoading, setIsLoading] = useState(false);

  if (!requestToken || !tabId) return null;

  const onUpdateProfile = async () => {
    setIsLoading(true);
    void analytics.track('request_update_profile_submit');
    const result = await updateProfileSoftwareWallet(publicProfile);
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
