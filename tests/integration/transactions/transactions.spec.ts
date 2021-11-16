import { TransactionsSelectors } from '@tests/integration/transactions.selectors';
import { BrowserDriver, createTestSelector, setupBrowser } from '../utils';
import { WalletPage } from '@tests/page-objects/wallet.page';
import { DemoPage } from '@tests/page-objects/demo.page';
import { ScreenPaths } from '@common/types';

jest.setTimeout(60_000);
jest.retryTimes(process.env.CI ? 2 : 0);

describe(`Transactions integration tests`, () => {
  let browser: BrowserDriver;
  let wallet: WalletPage;
  let demo: DemoPage;

  beforeEach(async () => {
    browser = await setupBrowser();
    wallet = await WalletPage.init(browser, ScreenPaths.INSTALLED);
    demo = browser.demo;
    await wallet.clickAllowAnalytics();
    await wallet.signUp();
    await demo.page.reload();
    // Pattern for opening popup in new page for testing
    // See the background script for conditionals using IS_TEST_ENV
    const [popup] = await Promise.all([
      browser.context.waitForEvent('page'),
      browser.demo.openConnect(),
    ]);
    const [response] = await Promise.all([
      popup.waitForNavigation(),
      popup.click(createTestSelector('account-account-1-0')),
    ]);
    // Response on redirect should be null
    if (response) console.log(response);
    await wallet.page.close();
    await demo.page.bringToFront();
  });

  afterEach(async () => {
    try {
      await browser.context.close();
    } catch (error) {}
  });

  it('should load contract call button', async () => {
    const buttonText = await demo.page.textContent(
      createTestSelector(TransactionsSelectors.BtnContractCall)
    );
    expect(buttonText).toContain('Contract call');
  });

  it('validates against insufficient funds when performing a contract call', async () => {
    const [popup] = await Promise.all([
      browser.context.waitForEvent('page'),
      demo.page.click(createTestSelector(TransactionsSelectors.BtnContractCall)),
    ]);
    const errorMsg = await popup.textContent(
      createTestSelector(TransactionsSelectors.TransactionErrorMessage)
    );
    expect(errorMsg).toBeTruthy();
  });
});
