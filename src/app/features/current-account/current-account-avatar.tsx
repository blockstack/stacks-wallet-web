import { memo, Suspense } from 'react';
import { BoxProps } from '@stacks/ui';
import { useCurrentAccount } from '@app/store/accounts/account.hooks';
import { useCurrentAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { AccountAvatar } from '@app/components/account/account-avatar/account-avatar';
import { getAccountDisplayName } from '@app/common/utils/get-account-display-name';
import { useDrawers } from '@app/common/hooks/use-drawers';

const AccountAvatarSuspense = memo((props: BoxProps) => {
  const currentAccount = useCurrentAccount();
  const name = useCurrentAccountDisplayName();
  const { setShowSwitchAccountsState } = useDrawers();
  if (!currentAccount) return null;
  return (
    <AccountAvatar
      onClick={() => setShowSwitchAccountsState(true)}
      cursor="pointer"
      name={name}
      publicKey={currentAccount.stxPublicKey}
      flexShrink={0}
      {...props}
    />
  );
});

export const CurrentAccountAvatar = memo((props: BoxProps) => {
  const currentAccount = useCurrentAccount();
  if (!currentAccount) return null;
  const defaultName = getAccountDisplayName(currentAccount);
  return (
    <Suspense
      fallback={
        <AccountAvatar
          name={defaultName}
          publicKey={currentAccount.stxPublicKey}
          flexShrink={0}
          {...props}
        />
      }
    >
      <AccountAvatarSuspense {...props} />
    </Suspense>
  );
});
