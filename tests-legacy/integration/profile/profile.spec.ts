import { Page } from '@playwright/test';
import { DemoPage } from '@tests-legacy/page-objects/demo.page';
import { ProfileUpdatingPage } from '@tests-legacy/page-objects/profile-updating.page';
import { WalletPage } from '@tests-legacy/page-objects/wallet.page';

import { RouteUrls } from '@shared/route-urls';

import { BrowserDriver, createTestSelector, getCurrentTestName, setupBrowser } from '../utils';
import { ProfileTabSelectors } from './profile-test-app.selectors';
import { ProfileUpdatingSelectors } from './profile-updating.selector';

jest.setTimeout(120_000);
jest.retryTimes(process.env.CI ? 2 : 0);

describe(`Profile updating`, () => {
  let browser: BrowserDriver;
  let wallet: WalletPage;
  let demo: DemoPage;

  beforeEach(async () => {
    browser = await setupBrowser();
    await browser.context.tracing.start({ screenshots: true, snapshots: true });
    wallet = await WalletPage.init(browser, RouteUrls.Onboarding);
    demo = browser.demo;
  });

  afterEach(async () => {
    try {
      await browser.context.tracing.stop({
        path: `trace-${getCurrentTestName()}.trace.zip`,
      });
      await browser.context.close();
    } catch (error) {
      console.log(error);
    }
  });

  describe('New created wallet scenarios', () => {
    let profileUpdatingPage: ProfileUpdatingPage;

    const clickBtn = async (selector: ProfileTabSelectors) => {
      const [page] = await Promise.all([
        browser.context.waitForEvent('page'),
        demo.page.click('text=Profile'),
        demo.page.click(createTestSelector(selector)),
      ]);
      profileUpdatingPage = new ProfileUpdatingPage(page);
    };

    function interceptGaiaRequest(page: Page): Promise<Buffer> {
      return new Promise(resolve => {
        page.on('request', request => {
          if (request.url().startsWith('https://hub.blockstack.org/store')) {
            const requestBody = request.postDataBuffer();
            if (request.method() === 'GET') return;
            if (requestBody === null) return;
            resolve(requestBody);
          }
        });
      });
    }

    beforeEach(async () => {
      await wallet.signUp();
      await demo.page.reload();
      const [popup] = await Promise.all([
        browser.context.waitForEvent('page'),
        browser.demo.openConnect(),
      ]);
      await popup.click(createTestSelector('account-account-1-0'));
      await wallet.page.close();
      await demo.page.bringToFront();
      await demo.page.click('text=Profile');
    });

    it('should show profile details', async () => {
      await clickBtn(ProfileTabSelectors.BtnUpdateValidProfile);

      const name = await profileUpdatingPage.page.textContent('text=twitter ');
      expect(name).toBe('https://twitter.com/twitterHandle');
    });

    it('should show an error for invalid profile', async () => {
      await clickBtn(ProfileTabSelectors.BtnUpdateInvalidProfile);

      const error = await profileUpdatingPage.waitForError(
        'Invalid profile update request (Profile must follow Person schema).'
      );
      expect(error).toBeTruthy();
    });

    it('should send a signed profile token to gaia', async () => {
      await clickBtn(ProfileTabSelectors.BtnUpdateValidProfile);

      const [gaiaRequestBody] = await Promise.all([
        interceptGaiaRequest(profileUpdatingPage.page),
        profileUpdatingPage.page
          .locator(createTestSelector(ProfileUpdatingSelectors.BtnUpdateProfile))
          .click(),
      ]);
      const { decodedToken } = JSON.parse(gaiaRequestBody.toString())[0];
      console.log(decodedToken.payload);
      expect(decodedToken?.header?.alg).toEqual('ES256K');
      expect(decodedToken?.payload?.claim?.name).toContain('Name ');
      expect(decodedToken?.payload?.claim?.image?.[0]?.contentUrl).toEqual(
        'https://byzantion.mypinata.cloud/ipfs/Qmb84UcaMr1MUwNbYBnXWHM3kEaDcYrKuPWwyRLVTNKELC/2256.png'
      );
    });
  });
});
