import { FiCheck } from 'react-icons/fi';

import { Flex, FlexProps, color } from '@stacks/ui';

import { Caption } from '@app/ui/components/typography/caption';

interface LedgerSuccessLabelProps extends FlexProps {
  children: React.ReactNode;
}
export function LedgerSuccessLabel({ children, ...props }: LedgerSuccessLabelProps) {
  return (
    <Flex alignItems="center" color={color('feedback-success')} flexDirection="row" {...props}>
      <FiCheck />
      <Caption color="inherited" ml="tight">
        {children}
      </Caption>
    </Flex>
  );
}
