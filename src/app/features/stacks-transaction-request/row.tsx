import { HStack, Stack, styled } from 'leather-styles/jsx';

import { Caption } from '@app/ui/components/typography/caption';

import { PrincipalValue } from './principal-value';

interface RowProps {
  name?: string | React.JSX.Element | null;
  type?: string;
  value: string;
}

export function Row({ name, type, value }: RowProps): React.JSX.Element {
  return (
    <Stack gap="space.03">
      <HStack alignItems="center" justifyContent="space-between" flexShrink={0}>
        {name && <Caption>{name}</Caption>}
        {type && <Caption>{type}</Caption>}
      </HStack>

      {type?.toLowerCase() === 'principal' ? (
        <PrincipalValue address={value} />
      ) : (
        <styled.span
          display="block"
          fontSize={2}
          fontWeight={500}
          lineHeight="1.6"
          wordBreak="break-all"
        >
          {value}
        </styled.span>
      )}
    </Stack>
  );
}
