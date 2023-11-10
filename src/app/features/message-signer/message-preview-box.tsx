import { Stack } from 'leather-styles/jsx';
import { styled } from 'leather-styles/jsx';

import { HashDrawer } from './hash-drawer';

interface MessageBoxProps {
  message: string;
  hash?: string;
}
export function MessagePreviewBox({ message, hash }: MessageBoxProps) {
  return (
    <Stack
      border="4px solid"
      paddingBottom={hash ? '8px' : 0}
      borderColor="accent.background-primary"
      borderRadius="20px"
      backgroundColor="accent.background-primary"
    >
      <Stack
        bg="accent.background-primary"
        borderRadius="16px"
        fontSize={2}
        lineHeight="1.6"
        px="space.05"
        py="space.05"
        gap="space.02"
        overflowX="auto"
      >
        {message.split(/\r?\n/).map(line => (
          <styled.span key={line} textStyle="label.01">
            {line}
          </styled.span>
        ))}
      </Stack>
      {hash ? <HashDrawer hash={hash} /> : null}
    </Stack>
  );
}
