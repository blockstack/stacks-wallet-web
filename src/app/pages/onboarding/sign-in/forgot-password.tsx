import { EnterMnemonic } from './enter-mnemonic';

export function ForgotPassword() {
  return (
    <EnterMnemonic
      title={<>Forgot password?</>}
      description="No worries, sign in with your Secret Keys and restore your wallet."
    />
  );
}
