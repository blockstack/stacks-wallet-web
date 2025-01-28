import { EnterMnemonic } from './enter-mnemonic';

export function SignIn() {
  return (
    <EnterMnemonic
      title={
        <>
          Sign in <br /> with your <br /> Secret Key
        </>
      }
      description="Speed things up by pasting your entire Secret Key in one go."
    />
  );
}
