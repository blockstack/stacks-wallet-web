import { FormEvent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Box, Stack, styled } from 'leather-styles/jsx';

import { Button, Link, Logo } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { buildEnterKeyEvent } from '@app/common/hooks/use-modifier-key';
import { WaitingMessages, useWaitingMessage } from '@app/common/hooks/use-waiting-message';
import { Card, Page } from '@app/components/layout';

import { ErrorLabel } from './error-label';

const waitingMessages: WaitingMessages = {
  '2': 'Verifying password…',
  '10': 'Still working…',
  '20': 'Almost there',
};

const caption =
  'Your password is used to secure your Secret Key and is only used locally on your device.';

interface RequestPasswordProps {
  onSuccess(): void;
  showForgotPassword?: boolean;
}
export function RequestPassword({ onSuccess, showForgotPassword = false }: RequestPasswordProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { unlockWallet } = useKeyActions();
  const navigate = useNavigate();

  const [isRunning, waitingMessage, startWaitingMessage, stopWaitingMessage] =
    useWaitingMessage(waitingMessages);

  const submit = useCallback(async () => {
    const startUnlockTimeMs = performance.now();
    void analytics.track('start_unlock');
    startWaitingMessage();
    setError('');
    try {
      await unlockWallet(password);
      onSuccess?.();
    } catch (error) {
      setError('The password you entered is invalid');
    }
    stopWaitingMessage();
    const unlockSuccessTimeMs = performance.now();
    void analytics.track('complete_unlock', {
      durationMs: unlockSuccessTimeMs - startUnlockTimeMs,
    });
  }, [startWaitingMessage, stopWaitingMessage, unlockWallet, password, onSuccess]);

  return (
    <Page>
      <Card
        contentStyle={{
          p: 'space.00',
        }}
        header={
          <styled.h1 p="space.04" hideBelow="sm">
            <Box px="space.02">
              <Logo />
            </Box>
          </styled.h1>
        }
        footer={
          <Button
            data-testid={SettingsSelectors.UnlockWalletBtn}
            disabled={isRunning || !!error}
            aria-busy={isRunning}
            onClick={submit}
            variant="solid"
            fullWidth
          >
            Continue
          </Button>
        }
      >
        <Stack gap="space.05" px="space.05" minHeight="330px">
          <styled.h3 textStyle="heading.03">Enter your password</styled.h3>
          <styled.p textStyle="label.02">{(isRunning && waitingMessage) || caption}</styled.p>
          <styled.input
            _focus={{ border: 'focus' }}
            autoCapitalize="off"
            autoComplete="off"
            autoFocus
            border="active"
            borderRadius="sm"
            data-testid={SettingsSelectors.EnterPasswordInput}
            height="inputHeight"
            onChange={(e: FormEvent<HTMLInputElement>) => {
              setError('');
              setPassword(e.currentTarget.value);
            }}
            onKeyUp={buildEnterKeyEvent(submit)}
            p="space.04"
            placeholder="Enter your password"
            ring="none"
            type="password"
            textStyle="body.02"
            value={password}
            width="100%"
          />
          {showForgotPassword && (
            <Link width="fit-content" onClick={() => navigate(RouteUrls.ForgotPassword)}>
              Forgot password?
            </Link>
          )}
          {error && <ErrorLabel width="100%">{error}</ErrorLabel>}
        </Stack>
      </Card>
    </Page>
  );
}
