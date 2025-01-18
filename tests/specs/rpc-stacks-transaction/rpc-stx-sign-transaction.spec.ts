import { BrowserContext, Page } from '@playwright/test';
import {
  MultiSigSpendingCondition,
  type TokenTransferPayloadWire,
  deserializeTransaction,
} from '@stacks/transactions';
import {
  TEST_ACCOUNT_1_PUBKEY,
  TEST_ACCOUNT_2_STX_ADDRESS,
  TEST_ACCOUNT_3_PUBKEY,
} from '@tests/mocks/constants';
import { generateMultisigUnsignedStxTransfer, generateUnsignedStxTransfer } from '@tests/utils';

import { test } from '../../fixtures/fixtures';

test.describe('RPC: stx_signTransaction', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  function checkVisibleContent(context: BrowserContext) {
    return async (buttonToPress: 'Cancel' | 'Confirm') => {
      const popup = await context.waitForEvent('page');
      await popup.waitForSelector('text="' + TEST_ACCOUNT_2_STX_ADDRESS + '"');
      await popup.waitForSelector(`text="${500 * 0.000001}"`);
      await popup.waitForTimeout(500);
      const btn = popup.locator('text="Confirm"');

      if (buttonToPress === 'Confirm') {
        await btn.click();
      } else {
        await popup.close();
      }
    };
  }

  function initiateTxSigningLeatherFormat(page: Page) {
    return async (txHex: string) =>
      page.evaluate(
        async txHex =>
          (window as any).LeatherProvider.request('stx_signTransaction', {
            txHex,
            network: 'mainnet',
          }).catch((e: unknown) => e),
        txHex
      );
  }

  function initiateTxSigningSip30Format(page: Page) {
    return async (hex: string) =>
      page.evaluate(
        async transaction =>
          (window as any).LeatherProvider.request('stx_signTransaction', { transaction }).catch(
            (e: unknown) => e
          ),
        hex
      );
  }

  test('that transaction details are the same after signing multi-signature STX transfer', async ({
    page,
    context,
  }) => {
    const amount = 500;
    const multiSignatureTxHex = await generateMultisigUnsignedStxTransfer(
      TEST_ACCOUNT_2_STX_ADDRESS,
      amount,
      100,
      'mainnet',
      [TEST_ACCOUNT_3_PUBKEY, TEST_ACCOUNT_1_PUBKEY],
      2,
      0
    );
    const [result] = await Promise.all([
      initiateTxSigningLeatherFormat(page)(multiSignatureTxHex),
      checkVisibleContent(context)('Confirm'),
    ]);

    // deserialize both transactions
    const deserializedUnsignedTxHex = deserializeTransaction(multiSignatureTxHex);
    const deserializedSignedTx = deserializeTransaction(result.result.txHex);
    // compare transactions
    test
      .expect((deserializedUnsignedTxHex.payload as TokenTransferPayloadWire).recipient)
      .toEqual((deserializedSignedTx.payload as TokenTransferPayloadWire).recipient);
    test
      .expect((deserializedUnsignedTxHex.payload as TokenTransferPayloadWire).amount)
      .toEqual((deserializedSignedTx.payload as TokenTransferPayloadWire).amount);
    test.expect(deserializedUnsignedTxHex.payload.type).toEqual(deserializedSignedTx.payload.type);
    test
      .expect(deserializedUnsignedTxHex.auth.spendingCondition.nonce)
      .toEqual(deserializedSignedTx.auth.spendingCondition.nonce);
    test
      .expect(deserializedUnsignedTxHex.auth.spendingCondition.fee)
      .toEqual(deserializedSignedTx.auth.spendingCondition.fee);
    test
      .expect(
        (deserializedUnsignedTxHex.auth.spendingCondition as MultiSigSpendingCondition)
          .signaturesRequired
      )
      .toEqual(
        (deserializedSignedTx.auth.spendingCondition as MultiSigSpendingCondition)
          .signaturesRequired
      );
    test
      .expect(deserializedUnsignedTxHex.auth.spendingCondition.signer)
      .toEqual(deserializedSignedTx.auth.spendingCondition.signer);
    test
      .expect(deserializedUnsignedTxHex.auth.spendingCondition.hashMode)
      .toEqual(deserializedSignedTx.auth.spendingCondition.hashMode);
    // check that the transaction is signed
    test
      .expect(
        (deserializedSignedTx.auth.spendingCondition as MultiSigSpendingCondition).fields.length
      )
      .toEqual(1);
  });

  test('Single signature STX transfer being rejected', async ({ page, context }) => {
    const amount = 500;
    const singleSignatureTxHex = await generateUnsignedStxTransfer(
      TEST_ACCOUNT_2_STX_ADDRESS,
      amount,
      'mainnet',
      TEST_ACCOUNT_3_PUBKEY
    );
    const [result] = await Promise.all([
      initiateTxSigningLeatherFormat(page)(singleSignatureTxHex),
      checkVisibleContent(context)('Cancel'),
    ]);

    // ID is random, removed so we can test known values
    delete result.id;

    test.expect(result).toEqual({
      jsonrpc: '2.0',
      error: {
        code: 4001,
        message: 'User rejected the Stacks transaction signing request',
      },
    });
  });

  test.describe('SIP-30 compatibility', () => {
    test('it works with SIP-30 formatted transactions', async ({ page, context }) => {
      const singleSignatureTxHex = await generateUnsignedStxTransfer(
        TEST_ACCOUNT_2_STX_ADDRESS,
        500,
        'mainnet',
        TEST_ACCOUNT_3_PUBKEY
      );
      const [result] = await Promise.all([
        initiateTxSigningSip30Format(page)(singleSignatureTxHex),
        checkVisibleContent(context)('Cancel'),
      ]);

      delete result.id;

      test.expect(result).toEqual({
        jsonrpc: '2.0',
        error: {
          code: 4001,
          message: 'User rejected the Stacks transaction signing request',
        },
      });
    });
  });
});
