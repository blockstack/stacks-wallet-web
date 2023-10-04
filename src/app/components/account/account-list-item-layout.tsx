import { Spinner } from '@stacks/ui';
import { truncateMiddle } from '@stacks/ui-utils';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Flex, HStack, Stack, StackProps, styled } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';

import { useViewportMinWidth } from '@app/common/hooks/use-media-query';
import { useConfigBitcoinEnabled } from '@app/query/common/remote-config/remote-config.query';

import { CaptionDotSeparator } from '../caption-dot-separator';
import { CheckmarkIcon } from '../icons/checkmark-icon';
import { Flag } from '../layout/flag';

interface AccountListItemLayoutProps extends StackProps {
  isLoading: boolean;
  isActive: boolean;
  index: number;
  stxAddress: string;
  btcAddress: string;
  accountName: React.ReactNode;
  avatar: React.JSX.Element;
  balanceLabel: React.ReactNode;
  hasCopied?: boolean;
  onCopyToClipboard?(e: React.MouseEvent): void;
  onClickBtcCopyIcon?(e: React.MouseEvent): void;
  onSelectAccount(): void;
}
export function AccountListItemLayout(props: AccountListItemLayoutProps) {
  const {
    index,
    isLoading,
    isActive,
    stxAddress,
    btcAddress,
    accountName,
    avatar,
    balanceLabel,
    onSelectAccount,
    hasCopied,
    onCopyToClipboard,
    onClickBtcCopyIcon,
    children = null,
    ...rest
  } = props;

  const isBreakpointSm = useViewportMinWidth('sm');
  const isBitcoinEnabled = useConfigBitcoinEnabled();

  return (
    <Flex
      width="100%"
      key={`account-${index}`}
      data-testid={SettingsSelectors.SwitchAccountItemIndex.replace('[index]', `${index}`)}
      cursor="pointer"
      position="relative"
      onClick={onSelectAccount}
      {...rest}
    >
      <Flag align="middle" img={avatar} spacing="space.04" width="100%" mr="space.04">
        <Stack gap="space.01">
          <HStack alignItems="center" justifyContent="space-between">
            <HStack alignItems="center" gap="space.02">
              {accountName}
              {isActive && <CheckmarkIcon />}
            </HStack>
            {isLoading ? (
              <Spinner
                position="absolute"
                right={0}
                top="calc(50% - 8px)"
                color={token('colors.accent.text-subdued')}
                size="18px"
              />
            ) : (
              balanceLabel
            )}
          </HStack>
          <HStack alignItems="center" gap="space.02" whiteSpace="nowrap">
            <CaptionDotSeparator>
              <styled.span textStyle="caption.02">
                {truncateMiddle(stxAddress, isBreakpointSm ? 4 : 3)}
              </styled.span>
              {isBitcoinEnabled && (
                <styled.span textStyle="caption.02">{truncateMiddle(btcAddress, 5)}</styled.span>
              )}
            </CaptionDotSeparator>
          </HStack>
        </Stack>
      </Flag>
      {children}
    </Flex>
  );
}
