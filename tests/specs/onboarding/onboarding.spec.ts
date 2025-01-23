import {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_1_STX_ADDRESS,
  TEST_ACCOUNT_1_TAPROOT_ADDRESS,
} from '@tests/mocks/constants';
import { testSoftwareAccountDefaultWalletState } from '@tests/page-object-models/onboarding.page';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';

import { BITCOIN_API_BASE_URL_MAINNET } from '@leather.io/models';

import { test } from '../../fixtures/fixtures';

test.describe('Onboarding an existing user', () => {
  test('going through the onboarding flow to sign in', async ({
    extensionId,
    globalPage,
    onboardingPage,
    homePage,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInExistingUser();
    await homePage.page.waitForTimeout(1000);

    const walletState = await onboardingPage.page.evaluate(async () =>
      window.debug.logPersistedStore()
    );

    // Deleting values that are known to differ at random
    delete (walletState as any).softwareKeys.entities.default.encryptedSecretKey;
    delete (walletState as any).softwareKeys.entities.default.salt;
    delete (testSoftwareAccountDefaultWalletState as any).softwareKeys.entities.default
      .encryptedSecretKey;
    delete (testSoftwareAccountDefaultWalletState as any).softwareKeys.entities.default.salt;

    test.expect(walletState).toEqual(testSoftwareAccountDefaultWalletState);
  });

  test('mnemonic key validation: should show error for invalid mnemonic key words', async ({
    extensionId,
    globalPage,
    onboardingPage,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    // enter some invalid key
    const invalidKey = 'some incorrect data';
    await onboardingPage.signInMnemonicKey(invalidKey);
    const signInButton = onboardingPage.page.getByTestId(OnboardingSelectors.SignInBtn);
    const error = onboardingPage.page.getByText('Words 1 and 2 are incorrect or misspelled');
    await test.expect(error).toBeVisible();
    await test.expect(signInButton).toBeDisabled();
  });

  test('mnemonic key validation: should not show error  for valid mnemonic key words', async ({
    extensionId,
    globalPage,
    onboardingPage,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    // enter some key partial
    const validPartialKey = 'shoulder any pencil';
    await onboardingPage.signInMnemonicKey(validPartialKey);
    const signInSeedError = onboardingPage.page.getByTestId(OnboardingSelectors.SignInSeedError);
    await test.expect(signInSeedError).not.toBeVisible();
  });

  test('Activity tab', async ({ extensionId, globalPage, onboardingPage, homePage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signUpNewUser();
    await page.route(`${BITCOIN_API_BASE_URL_MAINNET}/address/**/txs`, route =>
      route.fulfill({
        json: [],
      })
    );
    await homePage.clickActivityTab();
    const noActivityText = homePage.page.getByText('No activity yet');
    await test.expect(noActivityText).toBeVisible();
  });

  test.describe('Address generation', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await onboardingPage.signInExistingUser();
    });

    test.describe('Bitcoin', () => {
      test('that the wallet generates the correct Native Segwit address', async ({ homePage }) => {
        const nativeSegwitAddress = await homePage.getReceiveNativeSegwitAddress();
        test.expect(nativeSegwitAddress).toEqual(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS);
      });

      test('that the wallet generates the correct Taproot address', async ({ homePage }) => {
        const taprootAddress = await homePage.getReceiveTaprootAddress();
        test.expect(taprootAddress).toEqual(TEST_ACCOUNT_1_TAPROOT_ADDRESS);
      });
    });

    test.describe('Stacks', () => {
      test('that restoring a wallet generates the correct stacks address', async ({ homePage }) => {
        const stacksAddress = await homePage.getReceiveStxAddress();
        test.expect(stacksAddress).toEqual(TEST_ACCOUNT_1_STX_ADDRESS);
      });
    });
  });

  // Functionality is important for backwards compatibility with older wallet versions
  test.describe('Encryption key values', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await onboardingPage.signInWithTestAccount(extensionId);
    });

    test('that the encryption key is generated correctly against a known working value', async ({
      globalPage,
    }) => {
      const encryptionKey = await globalPage.page.evaluate(async () => {
        const { encryptionKey } = await chrome.storage.session.get('encryptionKey');
        return encryptionKey;
      });

      test
        .expect(encryptionKey)
        .toEqual(
          'd904f412b8d116540017c302f3f7033813c95902af5a067c7befcc34fa5e5290709f157f80548603a1e4f8edc2c0d5d7'
        );
    });
  });
});
