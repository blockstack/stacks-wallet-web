import { useEffect, useState } from 'react';

import { Link } from '@leather.io/ui';
import { createNullArrayOfLength } from '@leather.io/utils';

import { Content, TwoColumnLayout } from '@app/components/layout';
import { OnboardingHeader } from '@app/features/container/headers/onboarding.header';
import { MnemonicForm } from '@app/pages/onboarding/sign-in/mnemonic-form';

interface EnterMnemonicProps {
  title: React.ReactNode;
  description: React.ReactNode;
}

export function EnterMnemonic({ title, description }: EnterMnemonicProps) {
  const [twentyFourWordMode, setTwentyFourWordMode] = useState(true);
  const [mnemonic, setMnemonic] = useState<(string | null)[]>([]);

  useEffect(() => {
    const emptyMnemonicArray = twentyFourWordMode
      ? createNullArrayOfLength(24)
      : createNullArrayOfLength(12);
    setMnemonic(emptyMnemonicArray);
  }, [twentyFourWordMode]);

  return (
    <>
      <OnboardingHeader />
      <Content>
        <TwoColumnLayout
          title={title}
          content={description}
          action={
            <Link
              onClick={() => setTwentyFourWordMode(!twentyFourWordMode)}
              textStyle="label.03"
              width="fit-content"
              variant="text"
            >
              {twentyFourWordMode ? 'Have a 12-word Secret Key?' : 'Use 24 word Secret Key'}
            </Link>
          }
        >
          <MnemonicForm
            mnemonic={mnemonic}
            setMnemonic={setMnemonic}
            twentyFourWordMode={twentyFourWordMode}
          />
        </TwoColumnLayout>
      </Content>
    </>
  );
}
