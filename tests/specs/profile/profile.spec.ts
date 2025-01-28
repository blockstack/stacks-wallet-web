import { mockGaiaProfileResponse } from '@tests/mocks/mock-profile';
import { TestAppPage } from '@tests/page-object-models/test-app.page';
import { UpdateProfileRequestPage } from '@tests/page-object-models/update-profile-request.page';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';

import { delay } from '@leather.io/utils';

import { test } from '../../fixtures/fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Profile updating', () => {
  let testAppPage: TestAppPage;

  test.beforeEach(async ({ context, extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    testAppPage = await TestAppPage.openDemoPage(context);
  });

  test('should show an error for invalid profile', async ({ context }) => {
    const newPagePromise = context.waitForEvent('page');
    await testAppPage.page.getByTestId(OnboardingSelectors.SignUpBtn).click();
    const accountsPage = await newPagePromise;
    await delay(2000);
    await accountsPage.getByRole('button').getByText('Confirm').click({ force: true });
    await testAppPage.page.bringToFront();
    await testAppPage.page.click('text=Profile', {
      timeout: 30000,
    });
    await accountsPage.close();

    await testAppPage.clickUpdateInvalidProfileButton();
    const profileUpdatingPage = new UpdateProfileRequestPage(await context.waitForEvent('page'));
    const error = await profileUpdatingPage.waitForUpdateProfileRequestError(
      'Invalid profile update request (Profile must follow Person schema).'
    );

    test.expect(error).toBeTruthy();
    await profileUpdatingPage.page.close();
  });
});

test.describe('Gaia profile request', () => {
  let testAppPage: TestAppPage;

  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    testAppPage = await TestAppPage.openDemoPage(context);
  });

  test('should send a signed profile token to gaia', async ({ context }) => {
    const newPagePromise = context.waitForEvent('page');
    await testAppPage.page.getByTestId(OnboardingSelectors.SignUpBtn).click();
    const accountsPage = await newPagePromise;
    await delay(2000);
    await accountsPage.getByTestId('switch-account-item-0').click({ force: true });
    await accountsPage.getByTestId('switch-account-item-1').click({ force: true });
    await accountsPage.getByRole('button').getByText('Confirm').click({ force: true });
    await testAppPage.page.bringToFront();
    await testAppPage.page.click('text=Profile', {
      timeout: 30000,
    });

    await testAppPage.clickUpdateProfileButton();
    const profileUpdatingPage = new UpdateProfileRequestPage(await context.waitForEvent('page'));

    const requestPromise = profileUpdatingPage.page.waitForRequest('https://hub.blockstack.org/*');

    await profileUpdatingPage.page.route('https://gaia.hiro.so/hub/*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/octet-stream',
        body: JSON.stringify(mockGaiaProfileResponse),
      });
    });

    await profileUpdatingPage.page.route('https://hub.blockstack.org/*', async route => {
      await route.abort();
    });

    const name = profileUpdatingPage.page.getByText('twitter');
    const nameText = await name.innerText();
    test.expect(nameText).toBe('https://twitter.com/twitterHandle');

    await profileUpdatingPage.clickUpdateProfileButton();

    const request = await requestPromise;
    const requestBody = request.postData();
    if (!requestBody) return;

    const { decodedToken } = JSON.parse(requestBody)[0];
    test.expect(decodedToken).toBeDefined();

    test.expect(decodedToken?.header?.alg).toEqual('ES256K');
    test.expect(decodedToken?.payload?.claim?.name).toContain('Name ');
    test
      .expect(decodedToken?.payload?.claim?.image?.[0]?.contentUrl)
      .toEqual(
        'https://byzantion.mypinata.cloud/ipfs/Qmb84UcaMr1MUwNbYBnXWHM3kEaDcYrKuPWwyRLVTNKELC/2256.png'
      );
  });
});
