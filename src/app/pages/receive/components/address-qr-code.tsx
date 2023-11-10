import { memo, useMemo } from 'react';

import { createQR } from '@vkontakte/vk-qr';
import { Box, Flex } from 'leather-styles/jsx';

export const QrCode = memo(({ principal, ...rest }: { principal: string }) => {
  const qrSvg = useMemo(
    () =>
      createQR(principal, {
        ecc: 0,
        qrSize: 180,
        backgroundColor: 'accent.text-primary',
        foregroundColor: 'invert',
      }),
    [principal]
  );

  const qr = <Box dangerouslySetInnerHTML={{ __html: qrSvg }} />; // Bad?

  return (
    <Flex
      alignItems="center"
      border="1px solid"
      borderColor="accent.border-default"
      borderRadius="18px"
      boxShadow="low"
      justifyContent="center"
      mx="auto"
      p="space.05"
      position="relative"
      {...rest}
    >
      {qr}
      <Box position="absolute">{qr}</Box>
    </Flex>
  );
});
