import { Box } from 'leather-styles/jsx';

import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { AccountTotalBalance } from '@app/components/account-total-balance';
import { AccountAddresses } from '@app/components/account/account-addresses';
import { AccountListItemLayout } from '@app/components/account/account-list-item.layout';
import { AccountNameLayout } from '@app/components/account/account-name';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useNativeSegwitSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useStacksAccounts } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

interface CurrentAccountDisplayerProps {
  onSelectAccount(): void;
}
export function CurrentAccountDisplayer({ onSelectAccount }: CurrentAccountDisplayerProps) {
  const index = useCurrentAccountIndex();
  const stacksAccounts = useStacksAccounts();
  const stxAddress = stacksAccounts[index]?.address || '';
  const { data: name = '' } = useAccountDisplayName({ address: stxAddress, index });
  const bitcoinSigner = useNativeSegwitSigner(index);
  const bitcoinAddress = bitcoinSigner?.(0).address || '';
  return (
    <AccountListItemLayout
      withChevron
      accountAddresses={<AccountAddresses index={index} />}
      accountName={<AccountNameLayout isLoading={false}>{name}</AccountNameLayout>}
      avatar={
        <AccountAvatarItem
          index={index}
          publicKey={stacksAccounts[index]?.stxPublicKey || ''}
          name={name}
        />
      }
      balanceLabel={
        // Hack to center element without adjusting AccountListItemLayout
        <Box pos="relative" top={12}>
          <AccountTotalBalance stxAddress={stxAddress} btcAddress={bitcoinAddress} />
        </Box>
      }
      index={index}
      isLoading={false}
      isSelected={false}
      onSelectAccount={() => onSelectAccount()}
    />
  );
}
