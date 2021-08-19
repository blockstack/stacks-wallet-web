import React, { useState, useCallback, memo } from 'react';
import { Button, Stack, StackProps } from '@stacks/ui';
import { useWallet } from '@common/hooks/use-wallet';
import { useDoChangeScreen } from '@common/hooks/use-do-change-screen';
import { ScreenPaths } from '@common/types';
import { Link } from '@components/link';
import { PopupContainer } from '@components/popup/container';
import { useOnboardingState } from '@common/hooks/auth/use-onboarding-state';
import { Title, Text } from '@components/typography';
import { Header } from '@components/header';
import { InitialPageSelectors } from '@tests/integration/initial-page.selectors';
import ExploreStacksLarge from '@assets/images/explore-stacks-lg.svg';
import ExploreStacksSmall from '@assets/images/explore-stacks-sm.svg';

const Actions: React.FC<StackProps> = props => {
  const { doMakeWallet } = useWallet();
  const { decodedAuthRequest } = useOnboardingState();
  const doChangeScreen = useDoChangeScreen();

  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const register = useCallback(async () => {
    setIsCreatingWallet(true);
    await doMakeWallet();
    if (decodedAuthRequest) {
      doChangeScreen(ScreenPaths.SET_PASSWORD);
    }
  }, [doMakeWallet, doChangeScreen, decodedAuthRequest]);

  return (
    <Stack spacing="loose" textAlign="left" {...props}>
      <Button
        onClick={register}
        isLoading={isCreatingWallet}
        data-testid={InitialPageSelectors.SignUp}
        borderRadius="10px"
        width="198px"
        height="48px"
      >
        Create Stacks Account
      </Button>
      <Link
        onClick={() => doChangeScreen(ScreenPaths.SIGN_IN_INSTALLED)}
        data-testid={InitialPageSelectors.SignIn}
        fontSize="14px"
      >
        I already have an account
      </Link>
    </Stack>
  );
};

export const Installed: React.FC = memo(() => (
  <PopupContainer className="installed-page" header={<Header hideActions />} requestType="auth">
    <Stack className="content-image" flexGrow={1}>
      <img src={ExploreStacksLarge} className="image-large" />
      <img src={ExploreStacksSmall} className="image-small" />
    </Stack>
    <Stack className="content-text" flexGrow={1} justifyContent="center">
      <Stack width="100%" textAlign="left" alignItems="start">
        <Title className="title" fontWeight={500}>
          Explore the world of Stacks
        </Title>
        <Text className="text">
          Hiro Wallet connects you to Stacks apps while keeping your account, data, and crypto
          secure. Create your Stacks account to get started.
        </Text>
      </Stack>
      <Actions />
    </Stack>
  </PopupContainer>
));
