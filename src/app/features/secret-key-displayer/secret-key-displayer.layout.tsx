import { useState } from 'react';
import { FiCopy, FiEye, FiEyeOff } from 'react-icons/fi';

import YourSecretKey from '@assets/images/onboarding/your-secret-key.png';
import { Box, Stack, color } from '@stacks/ui';
import { SettingsSelectors } from '@tests-legacy/integration/settings.selectors';

import { Link } from '@app/components/link';
import { Text, Title } from '@app/components/typography';

import { SecretKeyWord } from './components/secret-key-word';

interface SecretKeyDisplayerLayoutProps {
  hasCopied: boolean;
  onCopyToClipboard(): void;
  secretKeyWords: string[] | undefined;
  showTitleAndIllustration: boolean;
}
export function SecretKeyDisplayerLayout(props: SecretKeyDisplayerLayoutProps) {
  const { hasCopied, onCopyToClipboard, secretKeyWords, showTitleAndIllustration } = props;
  const [showSecretKey, setShowSecretKey] = useState(false);

  return (
    <Box border="1px solid" borderColor={color('border')} borderRadius="16px">
      <Stack
        alignItems="center"
        p={['base-loose', 'extra-loose']}
        ml={['tight', 'extra-tight']}
        spacing="loose"
      >
        {showTitleAndIllustration ? (
          <>
            <Box width={['87px', '101px']}>
              <img src={YourSecretKey} />
            </Box>
            <Title fontSize="20px">Your Secret Key</Title>
          </>
        ) : null}

        <Stack isInline justifyContent="center" rowGap="tight" wrap="wrap">
          {secretKeyWords?.map(word => (
            <SecretKeyWord key={word} word={showSecretKey ? word : '*'.repeat(word.length)} />
          ))}
        </Stack>
        <Stack alignItems="center" isInline>
          <Link
            _hover={{ textDecoration: 'none' }}
            data-testid={SettingsSelectors.ShowSecretKeyBtn}
            fontSize="14px"
            onClick={() => setShowSecretKey(!showSecretKey)}
          >
            <Stack alignItems="center" isInline spacing="tight">
              {showSecretKey ? <FiEyeOff /> : <FiEye />}
              <Text color={color('accent')} whiteSpace="nowrap">
                {showSecretKey ? 'Hide key' : 'Show key'}
              </Text>
            </Stack>
          </Link>
        </Stack>
        <Link
          data-testid={SettingsSelectors.CopyKeyToClipboardBtn}
          _hover={{ textDecoration: 'none' }}
          fontSize="14px"
          onClick={!hasCopied ? onCopyToClipboard : undefined}
        >
          <Stack alignItems="center" isInline>
            {!hasCopied && <FiCopy />}
            <Text color={color('accent')}>{!hasCopied ? ' Copy to clipboard' : 'Copied!'}</Text>
          </Stack>
        </Link>
      </Stack>
    </Box>
  );
}
