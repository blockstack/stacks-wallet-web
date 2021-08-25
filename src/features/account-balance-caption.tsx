import React from 'react';
import { stacksValue } from '@common/stacks-utils';
import { Caption, Text } from '@components/typography';
import { color } from '@stacks/ui';
import { useAccountAvailableStxBalance } from '@store/accounts/account.hooks';

export const AccountBalanceCaption = ({ address }: { address: string }) => {
  const availableStxBalance = useAccountAvailableStxBalance(address);

  const balance = stacksValue({
    value: availableStxBalance || 0,
    withTicker: true,
    abbreviate: true,
  });

  return (
    <>
      <Text color={color('text-caption')} fontSize="10px">
        •
      </Text>
      <Caption>{balance}</Caption>
    </>
  );
};
