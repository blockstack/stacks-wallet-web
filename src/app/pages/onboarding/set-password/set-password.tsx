import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SetPassword from '@assets/images/onboarding/set-password.png';
import { Box, Stack, Text } from '@stacks/ui';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { Form, Formik } from 'formik';
import { debounce } from 'ts-debounce';
import * as yup from 'yup';

import { RouteUrls } from '@shared/route-urls';
import { isUndefined } from '@shared/utils';

import { useFinishAuthRequest } from '@app/common/authentication/use-finish-auth-request';
import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useOnboardingState } from '@app/common/hooks/auth/use-onboarding-state';
import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useRouteHeader } from '@app/common/hooks/use-route-header';
import {
  blankPasswordValidation,
  validatePassword,
} from '@app/common/validation/validate-password';
import { CenteredPageContainer } from '@app/components/centered-page-container';
import { CENTERED_FULL_PAGE_MAX_WIDTH } from '@app/components/global-styles/full-page-styles';
import { Header } from '@app/components/header';
import { PageTitle } from '@app/components/page-title';
import { PrimaryButton } from '@app/components/primary-button';
import { Caption } from '@app/components/typography';
import { OnboardingGate } from '@app/routes/onboarding-gate';
import { useStacksAccounts } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { PasswordField } from './components/password-field';

// Imported dynamically
// ts-unused-exports:disable-next-line
export function SetPasswordRoute() {
  return (
    <OnboardingGate>
      <SetPasswordPage />
    </OnboardingGate>
  );
}

interface SetPasswordFormValues {
  password: string;
  confirmPassword: string;
}
const setPasswordFormValues: SetPasswordFormValues = { password: '', confirmPassword: '' };

function SetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [strengthResult, setStrengthResult] = useState(blankPasswordValidation);
  const stacksAccounts = useStacksAccounts();
  const { setPassword } = useKeyActions();
  const finishSignIn = useFinishAuthRequest();
  const navigate = useNavigate();
  const { decodedAuthRequest } = useOnboardingState();
  const analytics = useAnalytics();

  useRouteHeader(<Header hideActions onClose={() => navigate(-1)} />);

  useEffect(() => {
    void analytics.page('view', '/set-password');
  }, [analytics]);

  const submit = useCallback(
    async (password: string) => {
      await setPassword(password);

      if (decodedAuthRequest) {
        if (!stacksAccounts) return;

        if (stacksAccounts && stacksAccounts.length > 1) {
          navigate(RouteUrls.ChooseAccount);
        } else {
          await finishSignIn(0);
        }
      } else {
        navigate(RouteUrls.Home);
      }
    },
    [setPassword, decodedAuthRequest, stacksAccounts, navigate, finishSignIn]
  );

  const onSubmit = useCallback(
    async ({ password }: SetPasswordFormValues) => {
      if (!password) return;
      setLoading(true);
      if (strengthResult.meetsAllStrengthRequirements) {
        void analytics.track('submit_valid_password');
        await submit(password);
        return;
      }
      setLoading(false);
    },
    [strengthResult, submit, analytics]
  );

  const validationSchema = yup.object({
    password: yup
      .string()
      .required()
      .test({
        message: 'Weak',
        test: debounce((value: unknown) => {
          if (isUndefined(value)) {
            setStrengthResult(blankPasswordValidation);
            return false;
          }
          if (typeof value !== 'string') return false;
          const result = validatePassword(value);
          setStrengthResult(result);
          if (!result.meetsAllStrengthRequirements) {
            void analytics.track('submit_invalid_password');
          }
          return result.meetsAllStrengthRequirements;
        }, 60) as unknown as yup.TestFunction<any, any>,
      }),
  });

  return (
    <CenteredPageContainer>
      <Formik
        initialValues={setPasswordFormValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        validateOnBlur
        validateOnMount
        validateOnChange
      >
        {({ dirty, isSubmitting, isValid }) => (
          <Form>
            <Stack
              maxWidth={CENTERED_FULL_PAGE_MAX_WIDTH}
              mb={['loose', 'unset']}
              px={['loose', 'unset']}
              spacing="loose"
            >
              <Box alignSelf={['start', 'center']} width={['95px', '117px']}>
                <img src={SetPassword} />
              </Box>
              <PageTitle textAlign={['left', 'center']}>Set a password</PageTitle>
              <Text lineHeight="1.5rem" textAlign={['left', 'center']}>
                Your password protects your Secret Key and is for this device only. To access your
                Stacks account on another device or wallet you’ll need just your Secret Key.
              </Text>
              <Caption mt="base" px={['unset', 'base-loose']}>
                Choose a strong password: longer than 12 characters, with symbols, numbers and
                words.
              </Caption>
              <Stack px={['unset', 'base-loose']} spacing="base">
                <PasswordField strengthResult={strengthResult} isDisabled={loading} />
                <PrimaryButton
                  data-testid={OnboardingSelectors.SetPasswordBtn}
                  isDisabled={loading || !(dirty && isValid)}
                  isLoading={loading || isSubmitting}
                  mt="tight"
                >
                  Continue
                </PrimaryButton>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </CenteredPageContainer>
  );
}
