import { styled } from 'leather-styles/jsx';

import { GenericError } from '@app/components/generic-error/generic-error';

// #FIXME 4476 we repeat this code over and over again
const body = `The transaction request was not properly authorized by any of your Leather accounts. This typically happens if you've logged into this app before using another account.`;
const helpTextList = [
  <styled.li mt="space.04" key={1}>
    Sign out of the app and sign back in to re-authenticate into the application. This should help
    you successfully sign your transaction with Leather.
  </styled.li>,
];
const title = 'Unauthorized request';

export function UnauthorizedRequest() {
  return <GenericError body={body} helpTextList={helpTextList} title={title} />;
}
