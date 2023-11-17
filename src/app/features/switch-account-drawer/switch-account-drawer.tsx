import { memo } from 'react';

import { Box } from 'leather-styles/jsx';

import { useCreateAccount } from '@app/common/hooks/account/use-create-account';
import { useWalletType } from '@app/common/use-wallet-type';
import { ControlledDrawer } from '@app/components/drawer/controlled-drawer';
import { store } from '@app/store';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useStacksAccounts } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useShowSwitchAccountsState } from '@app/store/ui/ui.hooks';

import { AccountListUnavailable } from './components/account-list-unavailable';
import { CreateAccountAction } from './components/create-account-action';
import { SwitchAccountList } from './components/switch-account-list';

export const SwitchAccountDrawer = memo(() => {
  const [isShowing, setShowSwitchAccountsState] = useShowSwitchAccountsState();

  const currentAccountIndex = useCurrentAccountIndex();
  const createAccount = useCreateAccount();
  const { whenWallet } = useWalletType();

  const stacksAccounts = useStacksAccounts();
  const btcAddressesNum = Object.keys(store.getState().ledger.bitcoin.entities).length / 2;
  const stacksAddressesNum = stacksAccounts.length;

  const onClose = () => setShowSwitchAccountsState(false);

  const onCreateAccount = () => {
    createAccount();
    setShowSwitchAccountsState(false);
  };

  if (isShowing && stacksAddressesNum === 0 && btcAddressesNum === 0) {
    return <AccountListUnavailable />;
  }

  return isShowing ? (
    <ControlledDrawer title="Select account" isShowing={isShowing} onClose={onClose}>
      <Box mb={whenWallet({ ledger: 'space.04', software: '' })}>
        <SwitchAccountList
          currentAccountIndex={currentAccountIndex}
          handleClose={onClose}
          addressesNum={stacksAddressesNum || btcAddressesNum}
        />
        {whenWallet({
          software: <CreateAccountAction onCreateAccount={onCreateAccount} />,
          ledger: <></>,
        })}
      </Box>
    </ControlledDrawer>
  ) : null;
});
