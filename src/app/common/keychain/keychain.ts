import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';

export function mnemonicToRootNode(secretKey: string) {
  const seed = mnemonicToSeedSync(secretKey);
  return HDKey.fromMasterSeed(seed);
}
