import { memo } from 'react';

import { useFormikContext } from 'formik';

import { BitcoinSendFormValues, StacksSendFormValues } from '@shared/models/form.model';

import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { AccountTotalBalance } from '@app/components/account-total-balance';
import { AccountAddresses } from '@app/components/account/account-addresses';
import { AccountListItemLayout } from '@app/components/account/account-list-item.layout';
import { AccountNameLayout } from '@app/components/account/account-name';
import { useNativeSegwitSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { StacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.models';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

interface AccountListItemProps {
  stacksAccount: StacksAccount;
  index: number;
  onClose(): void;
}
export const AccountListItem = memo(({ index, stacksAccount, onClose }: AccountListItemProps) => {
  const { setFieldValue, values } = useFormikContext<
    BitcoinSendFormValues | StacksSendFormValues
  >();
  const stacksAddress = stacksAccount?.address || '';
  const { data: name = '' } = useAccountDisplayName({ address: stacksAddress, index });
  const bitcoinSigner = useNativeSegwitSigner(index);
  const bitcoinAddress = bitcoinSigner?.(0).address || '';

  const onSelectAccount = () => {
    const isBitcoin = values.symbol === 'BTC';
    void setFieldValue('recipient', isBitcoin ? bitcoinAddress : stacksAddress, false);
    onClose();
  };

  return (
    <AccountListItemLayout
      accountAddresses={<AccountAddresses index={index} />}
      accountName={<AccountNameLayout>{name}</AccountNameLayout>}
      avatar={
        <AccountAvatarItem
          index={index}
          publicKey={stacksAccount?.stxPublicKey || ''}
          name={name}
        />
      }
      balanceLabel={<AccountTotalBalance stxAddress={stacksAddress} btcAddress={bitcoinAddress} />}
      index={index}
      isSelected={false}
      isLoading={false}
      onSelectAccount={onSelectAccount}
    />
  );
});
