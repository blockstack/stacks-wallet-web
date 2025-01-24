import { bytesToHex } from '@stacks/common';
import { decryptMnemonic as decrypt, encryptMnemonic as encrypt } from '@stacks/encryption';

import { deriveEncryptionKey } from './generate-encryption-key';
import { generateRandomHexString } from './generate-random-hex';

interface EncryptMnemonicArgs {
  secretKey: string;
  password: string;
}
export async function encryptMnemonic({ secretKey, password }: EncryptMnemonicArgs) {
  const salt = generateRandomHexString();
  const encryptionKey = await deriveEncryptionKey({ password, salt });
  const encryptedBuffer = await encrypt(secretKey, encryptionKey);
  return {
    salt,
    encryptedSecretKey: bytesToHex(encryptedBuffer),
    encryptionKey,
  };
}

/**
 * Decrypt an encrypted secret key. If no salt is present, then this encrypted key was
 * generated before introducing Argon2 hashing. If that is true, then
 * decrypt the secret key and re-encrypt it using an Argon2 hashed password.
 */
interface DecryptionMnemonic {
  encryptedSecretKey: string;
  password: string;
  salt?: string;
}
export async function decryptMnemonic({
  encryptedSecretKey,
  password,
  salt,
}: DecryptionMnemonic): Promise<{
  encryptedSecretKey: string;
  salt: string;
  secretKey: string;
  encryptionKey: string;
}> {
  if (salt) {
    const encryptionKey = await deriveEncryptionKey({ password, salt });
    const secretKey = await decrypt(encryptedSecretKey, encryptionKey);
    return {
      secretKey,
      encryptedSecretKey,
      salt,
      encryptionKey,
    };
  } else {
    // if there is no salt, decrypt the secret key, then re-encrypt with an argon2 hash
    const secretKey = await decrypt(encryptedSecretKey, password);
    const newEncryptedKey = await encryptMnemonic({ secretKey, password });
    return {
      secretKey,
      encryptedSecretKey: newEncryptedKey.encryptedSecretKey,
      salt: newEncryptedKey.salt,
      encryptionKey: newEncryptedKey.encryptedSecretKey,
    };
  }
}
