import {
  type AddressWire,
  ClarityType,
  ContractCallPayload,
  IntCV,
  StacksTransactionWire,
  TokenTransferPayloadWire,
  addressToString,
  createAddress,
  cvToString,
  serializeCV,
} from '@stacks/transactions';
import BigNumber from 'bignumber.js';

import type { CryptoCurrency } from '@leather.io/models';
import { useCryptoCurrencyMarketDataMeanAverage } from '@leather.io/query';
import {
  baseCurrencyAmountInQuote,
  convertToMoneyTypeWithDefaultOfZero,
  createMoney,
  formatMoney,
  i18nFormatCurrency,
  isDefined,
  microStxToStx,
} from '@leather.io/utils';

import { removeTrailingNullCharacters } from '@app/common/utils';

function safeAddressToString(address: AddressWire) {
  try {
    return addressToString(address);
  } catch (error) {
    return '';
  }
}

export function useStacksTransactionSummary(token: CryptoCurrency) {
  // TODO: unsafe type assumption
  const tokenMarketData = useCryptoCurrencyMarketDataMeanAverage(token as 'BTC' | 'STX');

  function formSentSummaryTxState(
    txId: string,
    signedTx: StacksTransactionWire,
    decimals?: number
  ) {
    return {
      state: {
        txLink: {
          blockchain: 'stacks',
          txid: txId || '',
        },
        txId,
        ...formReviewTxSummary(signedTx, token, decimals),
      },
    };
  }

  function formReviewTxSummary(tx: StacksTransactionWire, symbol = 'STX', decimals = 6) {
    if (symbol !== 'STX') {
      return formSip10TxSummary(tx, symbol, decimals);
    }

    const payload = tx.payload as TokenTransferPayloadWire;
    const txValue = payload.amount;
    const fee = tx.auth.spendingCondition.fee;
    const memoContent = payload?.memo?.content ?? '';
    const memoDisplayText = removeTrailingNullCharacters(memoContent) || 'No memo';

    return {
      recipient: safeAddressToString(createAddress(payload?.recipient?.value)),
      fee: formatMoney(convertToMoneyTypeWithDefaultOfZero('STX', Number(fee))),
      totalSpend: formatMoney(
        convertToMoneyTypeWithDefaultOfZero('STX', Number(txValue) + Number(fee))
      ),
      symbol: 'STX',
      txValue: microStxToStx(Number(txValue)).toString(),
      sendingValue: formatMoney(convertToMoneyTypeWithDefaultOfZero('STX', Number(txValue))),
      txFiatValue: i18nFormatCurrency(
        baseCurrencyAmountInQuote(createMoney(Number(payload.amount), 'STX'), tokenMarketData)
      ),
      txFiatValueSymbol: tokenMarketData.price.symbol,
      nonce: String(tx.auth.spendingCondition.nonce),
      memoDisplayText,
    };
  }

  function getSip10MemoDisplayText(payload: ContractCallPayload): string {
    const noMemoText = 'No memo';
    if (!isDefined(payload.functionArgs[3])) {
      return noMemoText;
    }
    const isSome = payload.functionArgs[3].type === ClarityType.OptionalSome;
    return isSome ? serializeCV(payload.functionArgs[3]) : noMemoText;
  }

  function formSip10TxSummary(tx: StacksTransactionWire, symbol: string, decimals = 6) {
    const payload = tx.payload as ContractCallPayload;
    const fee = tx.auth.spendingCondition.fee;
    const txValue = Number((payload.functionArgs[0] as IntCV).value);
    const memoDisplayText = getSip10MemoDisplayText(payload);

    const sendingValue = formatMoney(
      convertToMoneyTypeWithDefaultOfZero(symbol, txValue, decimals)
    );
    const feeValue = formatMoney(convertToMoneyTypeWithDefaultOfZero('STX', Number(fee)));
    const totalSpend = `${sendingValue} + ${feeValue}`;

    const currencyTxAmount = baseCurrencyAmountInQuote(
      createMoney(txValue, symbol.toUpperCase(), decimals),
      tokenMarketData
    );

    const txFiatValue = currencyTxAmount.amount.toNumber()
      ? i18nFormatCurrency(currencyTxAmount)
      : undefined;

    return {
      recipient: cvToString(payload.functionArgs[2]),
      txValue: new BigNumber(txValue).shiftedBy(-decimals).toString(),
      nonce: String(tx.auth.spendingCondition.nonce),
      fee: feeValue,
      totalSpend,
      sendingValue,
      txFiatValue,
      txFiatValueSymbol: tokenMarketData.price.symbol,
      memoDisplayText,
      symbol,
    };
  }

  return {
    formSentSummaryTxState,
    formReviewTxSummary,
  };
}
