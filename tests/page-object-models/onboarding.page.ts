import { Page } from '@playwright/test';
import { TEST_PASSWORD } from '@tests/mocks/constants';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';

import type { SupportedBlockchains } from '@leather.io/models';
import { createCounter, delay } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

export const TEST_ACCOUNT_SECRET_KEY = process.env.TEST_ACCOUNT_SECRET_KEY ?? '';

// If default wallet state changes, we'll need to update this
export const testSoftwareAccountDefaultWalletState = {
  chains: { stx: { default: { highestAccountIndex: 0, currentAccountIndex: 0 } } },
  appPermissions: {
    entities: {},
    ids: [],
  },
  softwareKeys: {
    ids: ['default'],
    entities: {
      default: {
        type: 'software',
        id: 'default',
        salt: 'a086b877fc757a4daa7c6343d2861c05',
        encryptedSecretKey:
          'ff735c244c72e1c7f7dc411b240ce6e30f87a43106cd1c87a77d3a6f80679176558ce2e73d1a089d6a83d8764b31d9d9043a6f79ca1104fb8238a6ae4f1e063bc1f1c3ba99c4c4e8b38d871963a7e3d8a0a4ed5e6525ec6702d9074dd9ee376c',
      },
    },
  },
  ledger: {
    bitcoin: {
      entities: {},
      ids: [],
    },
    stacks: {
      entities: {},
      ids: [],
    },
  },
  networks: { ids: [], entities: {}, currentNetworkId: 'mainnet' },
  ordinals: {},
  settings: {
    discardedInscriptions: [],
    userSelectedTheme: 'system',
    dismissedMessages: [],
  },
  manageTokens: { entities: {}, ids: [] },
  _persist: { version: 2, rehydrated: true },
};

const ledgerBitcoinKeysState = {
  entities: {
    "default/84'/0'/0'": {
      id: "default/84'/0'/0'",
      path: "m/84'/0'/0'",
      policy:
        "[e87a850b/84'/0'/0']xpub6BuKrNqTrGfsy8VAAdUW2KCxbHywuSKjg7hZuAXERXDv7GfuxUgUWdVRKNsgujcwdjEHCjaXWouPKi1m5gMgdWX8JpRcyMkrSxPe4Da3Lx8",
      walletId: 'default',
      targetId: '',
    },
    "default/84'/0'/1'": {
      id: "default/84'/0'/1'",
      path: "m/84'/0'/1'",
      policy:
        "[e87a850b/84'/0'/1']xpub6BuKrNqTrGft1dv2pR3Ey8VsBnSBkVVpehNsro8V8kaWMRGeUNv8yhJpTw62Ldqenm5kuVyC2bQqgc6yrKAruDKyzz18zi83Sg2FTwEHsrF",
      walletId: 'default',
      targetId: '',
    },
    "default/84'/0'/2'": {
      id: "default/84'/0'/2'",
      path: "m/84'/0'/2'",
      policy:
        "[e87a850b/84'/0'/2']xpub6BuKrNqTrGft5UhSiYcXtN1d9Cp8iwj9tBVLjfJtLUqUFYA2xjVmAiB4TbUP6uaX3qwNhrW3baGE1Fz49YNSFcEMTtcd4Uz25juszoCCy8w",
      walletId: 'default',
      targetId: '',
    },
    "default/84'/0'/3'": {
      id: "default/84'/0'/3'",
      path: "m/84'/0'/3'",
      policy:
        "[e87a850b/84'/0'/3']xpub6BuKrNqTrGft7h39ks3qJjcz3KusNtsDtr8t59t2MUneWoCqbGYLcqLeqRaXC5na2tWDDzncBBVNVPT55b6jLM4dT5f6aGvgaXEXV6VniL6",
      walletId: 'default',
      targetId: '',
    },
    "default/84'/0'/4'": {
      id: "default/84'/0'/4'",
      path: "m/84'/0'/4'",
      policy:
        "[e87a850b/84'/0'/4']xpub6BuKrNqTrGftAswPZxdCzxArCp1bsUh3JPizsMymSVanfVJqXR2wjsX7PBnwMXnXttiWU6pMdBgB82mR2BPDtSGcUfjD8QJTNca47iYkGD3",
      walletId: 'default',
      targetId: '',
    },
    "default/86'/0'/0'": {
      id: "default/86'/0'/0'",
      path: "m/86'/0'/0'",
      policy:
        "[e87a850b/86'/0'/0']xpub6C4MQD2bVDTfdnVe5AYKB6gE7BE4yQeKBRgukQ4Hi3phDB5fCYKEAdViQ2n7kZQ1t728QV4wKGgiR5qGigjNNrm5DCGWYUZDRVNWYb8ZWGK",
      walletId: 'default',
      targetId: '',
    },
    "default/86'/0'/1'": {
      id: "default/86'/0'/1'",
      path: "m/86'/0'/1'",
      policy:
        "[e87a850b/86'/0'/1']xpub6C4MQD2bVDTfgjjWZhmPMNDMFHFmrSmGzqJVpuf98XB8F5eNaQus6XmrcrTrTiiL2EscdC4cjztP5LfaW13vZ6eDuDHXXAq71W5KEHeEeKH",
      walletId: 'default',
      targetId: '',
    },
    "default/86'/0'/2'": {
      id: "default/86'/0'/2'",
      path: "m/86'/0'/2'",
      policy:
        "[e87a850b/86'/0'/2']xpub6C4MQD2bVDTfkGnARZXj6dRRF223bcyKAK2qCRKf9xyPQg7k4ZZc4FAHLcXhQ1NCVJCTVGEMd1YoRnBBDdgXKrmt4bm5XmF1ry9ox4Qsx3F",
      walletId: 'default',
      targetId: '',
    },
    "default/86'/0'/3'": {
      id: "default/86'/0'/3'",
      path: "m/86'/0'/3'",
      policy:
        "[e87a850b/86'/0'/3']xpub6C4MQD2bVDTfmbN4ZJfozbNRMqyD1jmMFcQTNRUNyjE2J6tdVggFoQ8KmxUpijsZX1E4iDciY5AmnHbq95BHMVGJAGZ1MAm7iupHkTBV6YE",
      walletId: 'default',
      targetId: '',
    },
    "default/86'/0'/4'": {
      id: "default/86'/0'/4'",
      path: "m/86'/0'/4'",
      policy:
        "[e87a850b/86'/0'/4']xpub6C4MQD2bVDTfq9RLtYxmqJRNsiviyuM51CFE1qqQbE6o8QN9Uix47Kvj4fqKFX5f88DyhxaX93L4H1WdSZChMZUWGUzPm54N9VfvsYJBvi9",
      walletId: 'default',
      targetId: '',
    },
  },
  ids: [
    "default/84'/0'/0'",
    "default/84'/0'/1'",
    "default/84'/0'/2'",
    "default/84'/0'/3'",
    "default/84'/0'/4'",
    "default/86'/0'/0'",
    "default/86'/0'/1'",
    "default/86'/0'/2'",
    "default/86'/0'/3'",
    "default/86'/0'/4'",
  ],
};

const ledgerStacksKeysState = {
  entities: {
    "default/44'/5757'/0'/0/0": {
      path: "m/44'/5757'/0'/0/0",
      stxPublicKey: '0329b076bc20f7b1592b2a1a5cb91dfefe8c966e50e256458e23dd2c5d63f8f1af',
      dataPublicKey:
        '04716759aa2d2ec9066ff699626c3404c5cc7e84e7295af6768a0fce2defcd1c50a9ee4b1fd1e63295abc47c81f602e77c497f4549fa68535c7abbe73854b62df7',
      id: "default/44'/5757'/0'/0/0",
      walletId: 'default',
      targetId: '',
    },
    "default/44'/5757'/0'/0/1": {
      path: "m/44'/5757'/0'/0/1",
      stxPublicKey: '035c63a8042cd820ae59b50cfb225b886d0837c97a5f5daa190037fcadf60a1da6',
      dataPublicKey:
        '04c8fba749c7be4a817c1bee8c24b7464f3be6f7e78f5c9ab43a57710f703155e059ce8b5fcb33e8c8d0ff154e964f99c486eed8b8b19f108cf5137a07275a277f',
      id: "default/44'/5757'/0'/0/1",
      walletId: 'default',
      targetId: '',
    },
    "default/44'/5757'/0'/0/2": {
      path: "m/44'/5757'/0'/0/2",
      stxPublicKey: '02dbcd4e19f13709889eebdb450f84b48195f8ada1673cd8e663ca409a09379740',
      dataPublicKey:
        '04614af2cb5b9a07fb9049713a860a09cd97549373e73104e32b814922392a97a3c6d938f2b7f6e771c5e6611be64b762919a435a242fa5796b5bb4b9728eb079e',
      id: "default/44'/5757'/0'/0/2",
      walletId: 'default',
      targetId: '',
    },
    "default/44'/5757'/0'/0/3": {
      path: "m/44'/5757'/0'/0/3",
      stxPublicKey: '03a9ee7ccb82ecdd9de236b4d1909f79e75d93ba0ae68494f0cf710a5bf1e47837',
      dataPublicKey:
        '04e3c33077024159f2a1aa28e4e73811d477fac3303f6395bfb8937994bc61d1a3b762d52ea4a57d0f2ed36523a96ffec74d1f05676e4411601402013f16f16374',
      id: "default/44'/5757'/0'/0/3",
      walletId: 'default',
      targetId: '',
    },
    "default/44'/5757'/0'/0/4": {
      path: "m/44'/5757'/0'/0/4",
      stxPublicKey: '03e8e4daeece139da8e03d06734712b3dce83175791b94f44185c3fdae9122d264',
      dataPublicKey:
        '04673e21fc8fb98131d843bcb10edb015dd3219bb1f730c81c6de13a9df91d5f1a709099cd0d41d535f45b3119d3458ccdc98614ee4833c99f09c7c62d654350fa',
      id: "default/44'/5757'/0'/0/4",
      walletId: 'default',
      targetId: '',
    },
  },
  ids: [
    "default/44'/5757'/0'/0/0",
    "default/44'/5757'/0'/0/1",
    "default/44'/5757'/0'/0/2",
    "default/44'/5757'/0'/0/3",
    "default/44'/5757'/0'/0/4",
  ],
  targetId: '',
};

const emptyKeysState = { entities: {}, ids: [] };

export function makeLedgerTestAccountWalletState(keysToInclude: SupportedBlockchains[]) {
  return {
    _persist: { rehydrated: true, version: 2 },
    chains: { stx: { default: { currentAccountIndex: 0, highestAccountIndex: 0 } } },
    softwareKeys: {
      entities: {},
      ids: [],
    },
    ledger: {
      bitcoin: keysToInclude.includes('bitcoin') ? ledgerBitcoinKeysState : emptyKeysState,
      stacks: keysToInclude.includes('stacks') ? ledgerStacksKeysState : emptyKeysState,
    },
    networks: { currentNetworkId: 'mainnet', entities: {}, ids: [] },
    onboarding: {
      hideSteps: false,
      stepsStatus: {
        'Add some funds': 0,
        'Back up secret key': 1,
        'Buy an NFT': 0,
        'Explore apps': 0,
      },
    },
    settings: { dismissedMessages: [], userSelectedTheme: 'system' },
  };
}

export class OnboardingPage {
  constructor(readonly page: Page) {}

  async setPassword() {
    await this.page.waitForURL('**' + RouteUrls.SetPassword);
    await this.page.getByTestId(OnboardingSelectors.NewPasswordInput).fill(TEST_PASSWORD);
    await this.page.waitForTimeout(100);
    await this.page.getByTestId(OnboardingSelectors.SetPasswordBtn).click();
  }

  async signUpNewUser() {
    await this.page.getByTestId(OnboardingSelectors.SignUpBtn).click();
    await this.page.waitForURL('**' + RouteUrls.BackUpSecretKey);
    await this.page.getByTestId(OnboardingSelectors.BackUpSecretKeyBtn).click();
    await this.setPassword();
  }
  async initiateSignIn() {
    await this.page.getByTestId(OnboardingSelectors.SignInLink).click();
  }

  /**
   * Use this to test the onboarding flow by going through step-by-step
   */
  async signInExistingUser(secretKey = TEST_ACCOUNT_SECRET_KEY) {
    await this.initiateSignIn();
    await this.enterMnemonicKey(secretKey);
    await this.page.getByTestId(OnboardingSelectors.SignInBtn).click();
    await this.setPassword();
    await this.page.waitForURL('**' + RouteUrls.Home);
    await this.page.getByTestId(HomePageSelectors.HomePageContainer).waitFor();
  }

  async signInMnemonicKey(secretKey = TEST_ACCOUNT_SECRET_KEY) {
    await this.initiateSignIn();
    await this.enterMnemonicKey(secretKey);
  }
  async enterMnemonicKey(secretKey: string) {
    // NOTE: TEST_ACCOUNT_SECRET_KEY needs to be obtained and set in .env
    if (!secretKey) throw new Error('No key found');
    const key = secretKey.split(' ');
    for (let i = 0; i < key.length; i++) {
      await this.page.getByTestId(`mnemonic-input-${i + 1}`).fill(key[i]);
    }
  }

  /**
   * Use this for tests that just need to be signed in. This will skip the
   * onboarding flow and initialise the wallet in a signed in state for the test
   * account
   */
  async signInWithTestAccount(id: string) {
    const testAccountDerivedKey =
      'd904f412b8d116540017c302f3f7033813c95902af5a067c7befcc34fa5e5290709f157f80548603a1e4f8edc2c0d5d7';

    const isSignedIn = async () => {
      const { encryptionKey } = await this.page.evaluate(() =>
        chrome.storage.session.get(['encryptionKey'])
      );
      const hasSessionKey = encryptionKey === testAccountDerivedKey;
      const hasAssetsTab = await this.page.getByText('Assets').isVisible();
      const hasActivityTab = await this.page.getByText('Activity').isVisible();

      return hasSessionKey && hasAssetsTab && hasActivityTab;
    };

    const iterationCounter = createCounter();

    do {
      if (iterationCounter.getValue() > 5) throw new Error('Unable to initialize wallet state');

      await this.page.evaluate(
        async walletState => chrome.storage.local.set({ 'persist:root': walletState }),
        testSoftwareAccountDefaultWalletState
      );

      await this.page.evaluate(
        async encryptionKey => chrome.storage.session.set({ encryptionKey }),
        testAccountDerivedKey
      );

      await this.page.goto(`chrome-extension://${id}/index.html`);
      await delay(1000 * iterationCounter.getValue());

      iterationCounter.increment();
    } while (!(await isSignedIn()));

    await this.page.evaluate(() => window.debug.setHighestAccountIndex(2));
  }

  /**
   * Use this for tests that just need to be signed in. This will skip the
   * onboarding flow and initialise the wallet in a signed in state for the test
   * account
   */
  async signInWithLedgerAccount(id: string, state: object) {
    await this.page.evaluate(
      async walletState => chrome.storage.local.set({ 'persist:root': walletState }),
      state
    );
    await this.page.goto(`chrome-extension://${id}/index.html`);
  }
}
