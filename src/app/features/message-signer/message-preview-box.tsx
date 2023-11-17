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
      bg="accent.background-primary"
      border="4px solid"
      borderColor="accent.background-primary"
      borderRadius="20px"
      paddingBottom={hash ? 'space.02' : 0}
    >
      <Stack
        bg="accent.background-primary"
        borderRadius="lg"
        fontSize={2}
        gap="space.02"
        lineHeight="1.6"
        px="space.05"
        py="space.05"
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
