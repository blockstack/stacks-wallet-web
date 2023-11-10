import { Flex } from 'leather-styles/jsx';

import { HasChildren } from '@app/common/has-children';
import { whenPageMode } from '@app/common/utils';

export function SendTransferFooter({ children }: HasChildren) {
  return (
    <Flex
      alignItems="center"
      bg={whenPageMode({
        full: 'unset',
        popup: 'accent.background-primary',
      })}
      // TODO #4476 check this border colour
      borderTop="1px solid #EFEFF2"
      bottom="0"
      justifyContent="center"
      position={whenPageMode({
        full: 'unset',
        popup: 'fixed',
      })}
      px="extra-loose"
      py="loose"
      width="100%"
      zIndex={999}
    >
      {children}
    </Flex>
  );
}
