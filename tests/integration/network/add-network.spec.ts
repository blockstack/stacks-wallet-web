import { RouteUrls } from '@shared/route-urls';

import { WalletPage } from '@tests/page-objects/wallet.page';
import { BrowserDriver, createTestSelector, setupBrowser } from '@tests/integration/utils';
import { SECRET_KEY_2 } from '@tests/mocks';
import { NetworkPage } from '@tests/page-objects/network-page';
import { SettingsSelectors } from '@tests/integration/settings.selectors';
import { NetworkSelectors } from '@tests/integration/network.selectors';

jest.setTimeout(60_0000);
jest.retryTimes(process.env.CI ? 2 : 0);

describe('Buy tokens test', () => {
  const BEFORE_EACH_TIMEOUT = 600000;

  let browser: BrowserDriver;
  let walletPage: WalletPage;
  let networkPage: NetworkPage;

  beforeEach(async () => {
    browser = await setupBrowser();
    walletPage = await WalletPage.init(browser, RouteUrls.Onboarding);
    await walletPage.signIn(SECRET_KEY_2);
    await walletPage.clickSettingsButton();
    await walletPage.page.click(createTestSelector(SettingsSelectors.ChangeNetworkAction));
    await walletPage.page.click(createTestSelector(SettingsSelectors.BtnAddNetwork));
    networkPage = new NetworkPage(walletPage.page);
  }, BEFORE_EACH_TIMEOUT);

  afterEach(async () => {
    try {
      await browser.context.close();
    } catch (error) {}
  });

  describe('Add new network', () => {
    it('validation error when address is empty', async () => {
      await networkPage.clickAddNetwork();
      await networkPage.waitForErrorMessage();
      const errorMsgElement = await networkPage.page.$$(networkPage.getSelector('$errorText'));
      const errorMessage = await errorMsgElement[0].innerText();
      expect(errorMessage).toEqual(NetworkSelectors.EmptyAddressError);
    });

    it('unable to fetch info from node', async () => {
      await networkPage.inputNetworkAddressField('https://www.google.com/');
      await networkPage.clickAddNetwork();
      await networkPage.waitForErrorMessage();
      const errorMsgElement = await networkPage.page.$$(networkPage.getSelector('$errorText'));
      const errorMessage = await errorMsgElement[0].innerText();
      expect(errorMessage).toEqual(NetworkSelectors.NoNodeFetch);
    });
  });
});
