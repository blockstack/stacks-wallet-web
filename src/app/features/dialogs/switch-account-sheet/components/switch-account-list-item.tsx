import { memo } from 'react';

import { getSwitchAccountSheetAccountNameSelector } from '@tests/selectors/account.selectors';

import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { useSwitchAccount } from '@app/common/hooks/account/use-switch-account';
import { useLoading } from '@app/common/hooks/use-loading';
import { AccountTotalBalance } from '@app/components/account-total-balance';
import { AccountAddresses } from '@app/components/account/account-addresses';
import { AccountListItemLayout } from '@app/components/account/account-list-item.layout';
import { AccountNameLayout } from '@app/components/account/account-name';
import { useNativeSegwitSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useStacksAccounts } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

interface SwitchAccountListItemProps {
  handleClose(): void;
  currentAccountIndex: number;
  index: number;
}
export const SwitchAccountListItem = memo(
  ({ handleClose, currentAccountIndex, index }: SwitchAccountListItemProps) => {
    const stacksAccounts = useStacksAccounts();
    const stxAddress = stacksAccounts[index]?.address || '';
    const bitcoinSigner = useNativeSegwitSigner(index);
    const btcAddress = bitcoinSigner?.(0).address || '';

    const { isLoading, setIsLoading, setIsIdle } = useLoading(
      'SWITCH_ACCOUNTS' + stxAddress || btcAddress
    );
    const { handleSwitchAccount } = useSwitchAccount(handleClose);
    const { data: name = '', isFetching: isFetchingBnsName } = useAccountDisplayName({
      address: stxAddress,
      index,
    });

    const handleClick = async () => {
      setIsLoading();
      setTimeout(async () => {
        await handleSwitchAccount(index);
        setIsIdle();
      }, 80);
    };

    return (
      <AccountListItemLayout
        accountAddresses={<AccountAddresses index={index} />}
        accountName={
          <AccountNameLayout
            data-testid={getSwitchAccountSheetAccountNameSelector(index)}
            isLoading={isFetchingBnsName}
          >
            {name}
          </AccountNameLayout>
        }
        avatar={
          <AccountAvatarItem
            index={index}
            publicKey={stacksAccounts[index]?.stxPublicKey || ''}
            name={name}
          />
        }
        balanceLabel={<AccountTotalBalance stxAddress={stxAddress} btcAddress={btcAddress} />}
        index={index}
        isLoading={isLoading}
        isSelected={currentAccountIndex === index}
        onSelectAccount={handleClick}
      />
    );
  }
);
