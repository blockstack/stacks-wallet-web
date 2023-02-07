import { FormEvent, useCallback, useState } from 'react';

import UnlockSession from '@assets/images/unlock-session.png';
import { Box, Input, Stack, color } from '@stacks/ui';
import { SettingsSelectors } from '@tests-legacy/integration/settings.selectors';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { WaitingMessages, useWaitingMessage } from '@app/common/utils/use-waiting-message';
import { PageTitle } from '@app/components/page-title';
import { Text } from '@app/components/typography';

import { ErrorLabel } from './error-label';
import { buildEnterKeyEvent } from './link';
import { PrimaryButton } from './primary-button';

const waitingMessages: WaitingMessages = {
  '2': 'Verifying password…',
  '10': 'Still working…',
  '20': 'Almost there',
};

interface RequestPasswordProps {
  onSuccess(password: string): void;
  title?: string;
  caption?: string;
}
export function RequestPassword({ title, caption, onSuccess }: RequestPasswordProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { unlockWallet } = useKeyActions();
  const analytics = useAnalytics();
  const [isRunning, waitingMessage, startWaitingMessage, stopWaitingMessage] =
    useWaitingMessage(waitingMessages);

  const submit = useCallback(async () => {
    const startUnlockTimeMs = performance.now();
    void analytics.track('start_unlock');
    startWaitingMessage();
    setError('');
    try {
      await unlockWallet(password);
      onSuccess?.(password);
    } catch (error) {
      setError('The password you entered is invalid');
    }
    stopWaitingMessage();
    const unlockSuccessTimeMs = performance.now();
    void analytics.track('complete_unlock', {
      durationMs: unlockSuccessTimeMs - startUnlockTimeMs,
    });
  }, [analytics, startWaitingMessage, stopWaitingMessage, unlockWallet, password, onSuccess]);

  return (
    <>
      <Box alignSelf={['start', 'center']} mt={['base', 'unset']} width={['97px', '115px']}>
        <img src={UnlockSession} />
      </Box>
      <PageTitle fontSize={[4, 7]}>{title}</PageTitle>
      <Text color={color('text-caption')}>{(isRunning && waitingMessage) || caption}</Text>
      <Stack spacing="base">
        <Input
          autoFocus
          borderRadius="10px"
          data-testid={SettingsSelectors.EnterPasswordInput}
          height="64px"
          isDisabled={isRunning}
          onChange={(e: FormEvent<HTMLInputElement>) => {
            setError('');
            setPassword(e.currentTarget.value);
          }}
          onKeyUp={buildEnterKeyEvent(submit)}
          placeholder="Enter your password"
          type="password"
          value={password}
          width="100%"
        />
        {error && (
          <Box>
            <ErrorLabel>
              <Text textStyle="caption">{error}</Text>
            </ErrorLabel>
          </Box>
        )}
      </Stack>
      <PrimaryButton
        data-testid={SettingsSelectors.UnlockWalletBtn}
        isDisabled={isRunning || !!error}
        isLoading={isRunning}
        onClick={submit}
      >
        Continue
      </PrimaryButton>
    </>
  );
}
