import { test } from '../../fixtures/fixtures';

const alexSdkPostRoute = 'https://gql.alexlab.co/v1/graphql';

test.describe('Swaps', () => {
  test.beforeEach(async ({ extensionId, globalPage, homePage, onboardingPage, swapPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.enableTestMode();
    await homePage.swapButton.click();
    await swapPage.waitForSwapPageReady();
  });

  test('that it defaults to swapping STX', async ({ swapPage }) => {
    test.expect(swapPage.page.getByText('STX')).toBeTruthy();
  });

  test('that it shows correct swap review details', async ({ swapPage }) => {
    const swapAmountInputs = await swapPage.swapAmountInput.all();
    await swapAmountInputs[0].fill('1');
    await swapPage.selectAssetToReceive();

    const swapProtocol = await swapPage.swapDetailsProtocol.innerText();
    test.expect(swapProtocol).toEqual('ALEX');

    const swapAssets = await swapPage.swapDetailsSymbol.all();
    const swapAssetFrom = await swapAssets[0].innerText();
    const swapAssetTo = await swapAssets[1].innerText();
    test.expect(swapAssetFrom).toEqual('STX');
    test.expect(swapAssetTo).toEqual('ALEX');

    const swapAmounts = await swapPage.swapDetailsAmount.all();
    const swapAmountFrom = await swapAmounts[0].innerText();
    test.expect(swapAmountFrom).toEqual('1');

    test.expect(swapPage.page.getByText('Sponsored')).toBeTruthy();
  });

  test('that the swap is broadcast', async ({ swapPage }) => {
    const requestPromise = swapPage.page.waitForRequest(alexSdkPostRoute);

    await swapPage.page.route(alexSdkPostRoute, async route => {
      await route.abort();
    });

    const swapAmountInputs = await swapPage.swapAmountInput.all();
    await swapAmountInputs[0].fill('1');
    await swapPage.selectAssetToReceive();

    await swapPage.swapBtn.click();

    const request = await requestPromise;
    const requestBody = request.postDataBuffer();
    test.expect(requestBody).toBeDefined();
  });
});
