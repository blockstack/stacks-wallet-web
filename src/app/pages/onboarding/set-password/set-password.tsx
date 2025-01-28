import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { Form, Formik } from 'formik';
import { debounce } from 'ts-debounce';
import * as yup from 'yup';

import { Button } from '@leather.io/ui';
import { isUndefined } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useFinishAuthRequest } from '@app/common/authentication/use-finish-auth-request';
import { useOnboardingState } from '@app/common/hooks/auth/use-onboarding-state';
import { useKeyActions } from '@app/common/hooks/use-key-actions';
import {
  blankPasswordValidation,
  validatePassword,
} from '@app/common/validation/validate-password';
import { Content, TwoColumnLayout } from '@app/components/layout';
import { OnboardingHeader } from '@app/features/container/headers/onboarding.header';
import { useStacksAccounts } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { PasswordField } from './components/password-field';

// Imported dynamically
// ts-unused-exports:disable-next-line
export function SetPasswordRoute() {
  return <SetPasswordPage />;
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

  useEffect(() => {
    void analytics.page('view', '/set-password');
  }, []);

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
    [strengthResult, submit]
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
    <>
      <OnboardingHeader />
      <Content>
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
              <TwoColumnLayout
                wideChild={false}
                title={
                  <>
                    Set a <br />
                    password
                  </>
                }
                content={
                  <>
                    Your password protects your Secret Key on this device only. To access your
                    wallet on another device, you'll need just your Secret Key.
                  </>
                }
              >
                <>
                  <PasswordField strengthResult={strengthResult} isDisabled={loading} />
                  <Button
                    data-testid={OnboardingSelectors.SetPasswordBtn}
                    disabled={loading || !(dirty && isValid)}
                    aria-busy={loading || isSubmitting}
                    mt="space.08"
                    type="submit"
                  >
                    Continue
                  </Button>
                </>
              </TwoColumnLayout>
            </Form>
          )}
        </Formik>
      </Content>
    </>
  );
}
