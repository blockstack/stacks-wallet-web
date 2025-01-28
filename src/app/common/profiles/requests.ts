import { getPublicKeyFromPrivate } from '@stacks/encryption';
import { Person } from '@stacks/profile';
import { getAppPrivateKey } from '@stacks/wallet-sdk';
import { TokenVerifier, decodeToken } from 'jsontokens';

import { isString } from '@leather.io/utils';

import type { ProfileUpdatePayload } from '@shared/utils/legacy-requests';

import { StacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.models';

export function getProfileDataContentFromToken(requestToken: string): ProfileUpdatePayload {
  const token = decodeToken(requestToken);
  if (isString(token.payload)) throw new Error('error decoding json token');
  return token.payload as unknown as ProfileUpdatePayload;
}

const UNAUTHORIZED_PROFILE_UPDATE_REQUEST =
  'The profile update request provided is not signed by this wallet.';

/**
 * Verify a profile update request.
 * A profile request is a signed JWT that is created on an app,
 * via `@stacks/connect`. The private key used to sign this JWT is an
 * `appPrivateKey`, which an app can get from authentication.
 *
 * The payload in this JWT can include an `stxAddress`. This indicates the
 * 'default' STX address that should be used to sign this transaction. This allows
 * the wallet to use the same account to update the profile for the account that was
 * used to sign in to the app.
 *
 * This JWT is invalidated if:
 * - The JWT is not signed properly
 * - The public key used to sign this profile update request does not match an `appPrivateKey`
 * for any of the accounts in this wallet.
 * - The `stxAddress` provided in the payload does not match an STX address
 * for any of the accounts in this wallet.
 *
 * @returns The decoded and validated `ProfileUpdatePayload`
 * @throws if the profile update request is invalid
 */
interface VerifyProfileUpdateRequestArgs {
  requestToken: string;
  accounts: StacksAccount[];
  appDomain: string;
}
export async function verifyProfileUpdateRequest({
  requestToken,
  accounts,
  appDomain,
}: VerifyProfileUpdateRequestArgs): Promise<ProfileUpdatePayload> {
  const token = decodeToken(requestToken);
  const payload = token.payload as unknown as ProfileUpdatePayload;
  const validationResult = Person.validateSchema(payload.profile, false);
  if (!validationResult.valid) {
    throw new Error('Profile update payload not following PublicPersonProfile schema');
  }
  const { publicKey, stxAddress } = payload as unknown as { publicKey: string; stxAddress: string };
  const verifier = new TokenVerifier('ES256k', publicKey);
  const isSigned = await verifier.verifyAsync(requestToken);
  if (!isSigned) {
    throw new Error('Profile update request is not signed');
  }
  const foundAccount = accounts.find(account => {
    if (account.type === 'ledger') {
      throw new Error('Invalid account type');
    }
    const appPrivateKey = getAppPrivateKey({
      account,
      appDomain,
    });
    const appPublicKey = getPublicKeyFromPrivate(appPrivateKey);
    if (appPublicKey !== publicKey) return false;
    if (!stxAddress) return true;

    if (stxAddress !== account.address) return false;
    return true;
  });

  if (!foundAccount) {
    throw new Error(UNAUTHORIZED_PROFILE_UPDATE_REQUEST);
  }
  return payload;
}
