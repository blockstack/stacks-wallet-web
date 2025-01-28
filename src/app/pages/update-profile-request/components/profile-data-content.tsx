import { ChainId } from '@stacks/network';
import { Person } from '@stacks/profile';

import { getProfileDataContentFromToken } from '@app/common/profiles/requests';
import { Disclaimer } from '@app/components/disclaimer';
import { NoFeesWarningRow } from '@app/components/no-fees-warning-row';

import { ProfileBox } from './profile-box';
import { UpdateAction } from './update-action';

interface ProfileDataContentProps {
  requestToken: string;
}

export function ProfileDataContent(props: ProfileDataContentProps) {
  const { requestToken } = props;
  const profileUpdateRequest = getProfileDataContentFromToken(requestToken);
  const person = new Person(profileUpdateRequest.profile);
  const { network } = profileUpdateRequest;
  return (
    <>
      <ProfileBox profile={person} />
      <NoFeesWarningRow chainId={network?.chainId ?? ChainId.Testnet} />
      <UpdateAction profileUpdaterPayload={profileUpdateRequest} />
      <hr />
      <Disclaimer
        disclaimerText="This update will overwrite any values in your public profile with the included property names."
        learnMoreUrl="https://docs.hiro.so/build-apps/transaction-signing#get-the-users-stacks-address"
      />
    </>
  );
}
