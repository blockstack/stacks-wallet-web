import { memo } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { Box } from '@stacks/ui';

import { WalletAccount } from '@app/store/accounts/account.models';

import { SwitchAccountListItem } from './switch-account-list-item';

const smallNumberOfAccountsToRenderWholeList = 10;

interface SwitchAccountListProps {
  handleClose: () => void;
  accounts: WalletAccount[];
  currentAccountIndex: number;
}
export const SwitchAccountList = memo(
  ({ accounts, currentAccountIndex, handleClose }: SwitchAccountListProps) => {
    if (accounts.length <= smallNumberOfAccountsToRenderWholeList) {
      return (
        <>
          {accounts.map(account => (
            <Box key={account.address} mx={['base-loose', 'extra-loose']}>
              <SwitchAccountListItem handleClose={handleClose} account={account} />
            </Box>
          ))}
        </>
      );
    }

    return (
      <Virtuoso
        initialTopMostItemIndex={currentAccountIndex}
        height="72px"
        style={{ paddingTop: '24px', height: '70vh' }}
        totalCount={accounts.length}
        itemContent={index => (
          <Box mx={['base-loose', 'extra-loose']} key={accounts[index].address}>
            <SwitchAccountListItem handleClose={handleClose} account={accounts[index]} />
          </Box>
        )}
      />
    );
  }
);
