import { Caption, Spinner } from '@leather-wallet/ui';
import { Flex, FlexProps } from 'leather-styles/jsx';

interface LookingForLedgerLabelProps extends FlexProps {
  children: React.ReactNode;
}
export function LookingForLedgerLabel({ children, ...props }: LookingForLedgerLabelProps) {
  return (
    <Flex alignItems="center" flexDirection="row" {...props}>
      <Spinner opacity={0.5} />
      <Caption ml="space.02">{children}</Caption>
    </Flex>
  );
}
