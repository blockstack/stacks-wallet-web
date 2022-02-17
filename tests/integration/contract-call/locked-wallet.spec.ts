import { RouteUrls } from '@shared/route-urls';

import { SendPage } from '../../page-objects/send-form.page';
import { WalletPage } from '../../page-objects/wallet.page';
import { BrowserDriver, createTestSelector, selectTestnet, setupBrowser } from '../utils';
import { SECRET_KEY_2 } from '@tests/mocks';
import { SettingsSelectors } from '@tests/integration/settings.selectors';
import { Page } from 'playwright-core';

jest.setTimeout(60_0000);
jest.retryTimes(process.env.CI ? 2 : 0);

describe('Locked wallet test', () => {
  const BEFORE_EACH_TIMEOUT = 600000;

  let browser: BrowserDriver;
  let walletPage: WalletPage;
  let mainPage: WalletPage;
  let sendForm: SendPage;
  let pages: Page[];
  let latestPage: Page;

  beforeEach(async () => {
    browser = await setupBrowser();
    walletPage = await WalletPage.init(browser, RouteUrls.Onboarding);
    await walletPage.signIn(SECRET_KEY_2);
    await walletPage.waitForHomePage();
    // switch to test net
    await selectTestnet(walletPage);
    pages = await WalletPage.getAllPages(browser);
    mainPage = new WalletPage(pages[1]);
    await mainPage.clickSignUp();

    pages = await WalletPage.getAllPages(browser);
    latestPage = pages[pages.length - 1];
    sendForm = new SendPage(latestPage);
    await sendForm.waitForPreview('$account1');
    await sendForm.clickFirstAccount();
  }, BEFORE_EACH_TIMEOUT);

  afterEach(async () => {
    try {
      await browser.context.close();
    } catch (error) {}
  });

  it('when wallet is locked it shows unlock screen', async () => {
    await walletPage.clickSettingsButton();
    await walletPage.page.click(createTestSelector(SettingsSelectors.LockListItem));

    await mainPage.clickContractCall();
    pages = await WalletPage.getAllPages(browser);
    latestPage = pages[pages.length - 1];
    sendForm = new SendPage(latestPage);
    await sendForm.page.waitForSelector(mainPage.$passwordInput);
    const isPasswordVisible = await sendForm.page.isVisible(mainPage.$passwordInput);
    expect(isPasswordVisible).toBe(true);
  });

  it('when wallet is not locked', async () => {
    await mainPage.clickContractCall();
    pages = await WalletPage.getAllPages(browser);
    latestPage = pages[pages.length - 1];
    sendForm = new SendPage(latestPage);
    await sendForm.waitForPreview('$standardFeeSelect');
    const isVisibleForm = await sendForm.page.isVisible(sendForm.getSelector('$standardFeeSelect'));
    expect(isVisibleForm).toBe(true);
  });
});
