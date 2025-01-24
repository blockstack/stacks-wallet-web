import { TokenTransferPayloadWire, deserializeTransaction } from '@stacks/transactions';
import { TestAppPage } from '@tests/page-object-models/test-app.page';
import { TransactionRequestPage } from '@tests/page-object-models/transaction-request.page';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';

import { stxToMicroStx } from '@leather.io/utils';

import { createDelay } from '@shared/utils';

import { test } from '../../fixtures/fixtures';

const delayAnimationDuration = createDelay(2000);

test.describe('Transaction signing', () => {
  let testAppPage: TestAppPage;

  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    testAppPage = await TestAppPage.openDemoPage(context);
  });

  // These tests often break if ran in parallel
  test.describe.configure({ mode: 'serial' });

  test.describe('Contract calls', () => {
    test('that it validates against insufficient funds when performing a contract call', async ({
      context,
    }) => {
      const newPagePromise = context.waitForEvent('page');
      await testAppPage.page.getByTestId(OnboardingSelectors.SignUpBtn).click();
      const accountsPage = await newPagePromise;
      await accountsPage.getByTestId('switch-account-item-0').click({ force: true });
      await accountsPage.getByTestId('switch-account-item-1').click({ force: true });
      await delayAnimationDuration();
      await accountsPage.getByRole('button').getByText('Confirm').click({ force: true });
      await delayAnimationDuration();
      await testAppPage.page.bringToFront();
      await testAppPage.page.click('text=Debugger', {
        timeout: 30000,
      });
      await accountsPage.close();

      await testAppPage.clickContractCallButton();
      const transactionRequestPage = new TransactionRequestPage(await context.waitForEvent('page'));
      await transactionRequestPage.waitForTransactionRequestPage();
      const error =
        await transactionRequestPage.waitForTransactionRequestError('Insufficient balance');

      test.expect(error).toBeTruthy();
    });
  });

  test.describe('App initiated STX transfer', () => {
    test('that it broadcasts correctly with given fee and amount', async ({ context }) => {
      const newPagePromise = context.waitForEvent('page');
      await testAppPage.page.getByTestId(OnboardingSelectors.SignUpBtn).click();
      const accountsPage = await newPagePromise;
      await delayAnimationDuration();
      await accountsPage.getByRole('button').getByText('Confirm').click({ force: true });
      await delayAnimationDuration();
      await testAppPage.page.bringToFront();
      await testAppPage.page.click('text=Debugger', {
        timeout: 30000,
      });
      await accountsPage.close();

      await testAppPage.clickStxTransferButton();
      const transactionRequestPage = new TransactionRequestPage(await context.waitForEvent('page'));

      await transactionRequestPage.waitForTransactionRequestPage();
      await transactionRequestPage.waitForFee();

      const displayedFee = await transactionRequestPage.getDisplayedFeeValue();

      if (!displayedFee) throw new Error('Cannot pull fee from UI');

      const requestPromise = transactionRequestPage.page.waitForRequest('*/**/v2/transactions');

      await transactionRequestPage.page.route('*/**/v2/transactions', async route => {
        await route.abort();
      });

      await transactionRequestPage.clickConfirmTransactionButton();

      const request = await requestPromise;
      const requestBody = request.postData();
      if (!requestBody) return;

      const deserialisedTx = deserializeTransaction(requestBody);
      const payload = deserialisedTx.payload as TokenTransferPayloadWire;
      const amount = Number(payload.amount);
      const fee = Number(deserialisedTx.auth.spendingCondition?.fee);
      const parsedDisplayedFee = parseFloat(displayedFee.replace(' STX', ''));

      test.expect(fee).toEqual(stxToMicroStx(parsedDisplayedFee).toNumber());
      test.expect(amount).toEqual(102);
    });
  });
});
