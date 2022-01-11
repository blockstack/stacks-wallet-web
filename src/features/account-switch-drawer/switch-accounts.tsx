import React, { memo, useCallback } from 'react';
import { Box, Fade, Button, Stack, color, BoxProps, Spinner } from '@stacks/ui';
import { Title, Caption } from '@components/typography';

import { getAccountDisplayName } from '@stacks/wallet-sdk';
import { truncateMiddle } from '@stacks/ui-utils';
import { SpaceBetween } from '@components/space-between';
import { FiCheck as IconCheck } from 'react-icons/fi';
import { AccountAvatar } from '@components/account-avatar/account-avatar';
import { useAccountDisplayName } from '@common/hooks/account/use-account-names';
import { useSwitchAccount } from '@common/hooks/account/use-switch-account';
import { useLoading } from '@common/hooks/use-loading';
import { SettingsSelectors } from '@tests/integration/settings.selectors';
import { AccountBalanceCaption } from '@components/account-balance-caption';
import { useAccountAvailableStxBalance, useAccounts } from '@store/accounts/account.hooks';
import { useUpdateAccountDrawerStep } from '@store/ui/ui.hooks';
import { AccountStep } from '@store/ui/ui.models';
import { AccountWithAddress } from '@store/accounts/account.models';
import { useAnalytics } from '@common/hooks/analytics/use-analytics';

interface SwitchAccountProps {
  close: () => void;
}

interface WithAccount {
  account: AccountWithAddress;
}

const AccountNameSuspense = memo(({ account }: WithAccount) => {
  const name = useAccountDisplayName(account);

  return (
    <Title fontSize={2} lineHeight="1rem" fontWeight="400" fontFamily="'Inter'">
      {name}
    </Title>
  );
});

const AccountName = memo(({ account, ...rest }: BoxProps & WithAccount) => {
  const defaultName = getAccountDisplayName(account);
  return (
    <Box {...rest}>
      <React.Suspense
        fallback={
          <Title fontSize={2} lineHeight="1rem" fontWeight="400">
            {defaultName}
          </Title>
        }
      >
        <AccountNameSuspense account={account} />
      </React.Suspense>
    </Box>
  );
});

const AccountAvatarSuspense = memo(({ account }: { account: AccountWithAddress }) => {
  const name = useAccountDisplayName(account);
  return <AccountAvatar name={name} account={account} />;
});

const AccountAvatarItem = memo(({ account, ...rest }: BoxProps & WithAccount) => {
  const defaultName = getAccountDisplayName(account);
  return (
    <Box {...rest}>
      <React.Suspense fallback={<AccountAvatar name={defaultName} account={account} />}>
        <AccountAvatarSuspense account={account} />
      </React.Suspense>
    </Box>
  );
});

const AccountListItem = memo(
  ({ account, handleClose }: { account: AccountWithAddress; handleClose: () => void }) => {
    const { isLoading, setIsLoading, setIsIdle } = useLoading('SWITCH_ACCOUNTS' + account.address);
    const availableStxBalance = useAccountAvailableStxBalance(account.address);
    const { handleSwitchAccount, getIsActive } = useSwitchAccount(handleClose);
    const handleClick = useCallback(async () => {
      setIsLoading();
      setTimeout(async () => {
        await handleSwitchAccount(account.index);
        setIsIdle();
      }, 80);
    }, [setIsLoading, setIsIdle, account.index, handleSwitchAccount]);
    return (
      <SpaceBetween
        width="100%"
        key={`account-${account.index}`}
        data-testid={SettingsSelectors.AccountIndex.replace('[index]', `${account.index}`)}
        _hover={{
          bg: color('bg-4'),
        }}
        cursor="pointer"
        py="base"
        px="extra-loose"
        onClick={handleClick}
        position="relative"
      >
        <Stack isInline alignItems="center" spacing="base">
          <AccountAvatarItem account={account} />
          <Stack spacing="base-tight">
            <AccountName account={account} />
            <Stack alignItems="center" spacing="6px" isInline>
              <Caption>{truncateMiddle(account.address, 4)}</Caption>
              <React.Suspense fallback={<></>}>
                <AccountBalanceCaption availableBalance={availableStxBalance} />
              </React.Suspense>
            </Stack>
          </Stack>
        </Stack>
        <Fade in={isLoading}>
          {styles => (
            <Spinner
              position="absolute"
              right="loose"
              color={color('text-caption')}
              size="18px"
              style={styles}
            />
          )}
        </Fade>
        <Fade in={getIsActive(account.index)}>
          {styles => (
            <Box
              as={IconCheck}
              size="18px"
              strokeWidth={2.5}
              color={color('brand')}
              style={styles}
              data-testid={`account-checked-${account.index}`}
            />
          )}
        </Fade>
      </SpaceBetween>
    );
  }
);

const AccountList: React.FC<{ handleClose: () => void }> = memo(({ handleClose }) => {
  const accounts = useAccounts();
  return accounts ? (
    <>
      {accounts.map(account => {
        return (
          <AccountListItem handleClose={handleClose} key={account.address} account={account} />
        );
      })}
    </>
  ) : null;
});

export const SwitchAccounts: React.FC<SwitchAccountProps> = memo(({ close }) => {
  const setAccountDrawerStep = useUpdateAccountDrawerStep();
  const analytics = useAnalytics();
  const setCreateAccountStep = () => {
    void analytics.track('choose_to_create_account');
    setAccountDrawerStep(AccountStep.Create);
  };

  return (
    <>
      <AccountList handleClose={close} />
      <Box pt="base" pb="loose" px="loose">
        <Button onClick={setCreateAccountStep}>Create an account</Button>
      </Box>
    </>
  );
});
