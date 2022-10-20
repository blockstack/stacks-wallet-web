import { ReactNode } from 'react';
import { color, Stack, Text } from '@stacks/ui';

interface PendingTransactionListLayoutProps {
  children: ReactNode;
}
export const PendingTransactionListLayout = ({ children }: PendingTransactionListLayoutProps) => {
  return (
    <>
      <Text color={color('text-caption')} textStyle="body.small">
        Pending
      </Text>
      <Stack mt="base-loose" pb="extra-loose" spacing="loose">
        {children}
      </Stack>
    </>
  );
};
