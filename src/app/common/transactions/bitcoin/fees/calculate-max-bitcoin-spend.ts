import BigNumber from 'bignumber.js';

import { AverageBitcoinFeeRates } from '@shared/models/fees/bitcoin-fees.model';
import { createMoney } from '@shared/models/money.model';

import { satToBtc } from '@app/common/money/unit-conversion';
import { UtxoResponseItem } from '@app/query/bitcoin/bitcoin-client';

import { filterUneconomicalUtxos, getSpendableAmount } from '../utils';

interface CalculateMaxBitcoinSpend {
  address: string;
  utxos: UtxoResponseItem[];
  fetchedFeeRates?: AverageBitcoinFeeRates;
  feeRate?: number;
}

export function calculateMaxBitcoinSpend({
  address,
  utxos,
  feeRate,
  fetchedFeeRates,
}: CalculateMaxBitcoinSpend) {
  if (!utxos.length || !fetchedFeeRates)
    return {
      spendAllFee: 0,
      amount: createMoney(0, 'BTC'),
      spendableBitcoin: new BigNumber(0),
    };

  const currentFeeRate = feeRate ?? fetchedFeeRates.halfHourFee.toNumber();

  const filteredUtxos = filterUneconomicalUtxos({
    utxos,
    feeRate: currentFeeRate,
    address,
  });

  const { spendableAmount, fee } = getSpendableAmount({
    utxos: filteredUtxos,
    feeRate: currentFeeRate,
    address,
  });

  return {
    spendAllFee: fee,
    amount: createMoney(spendableAmount, 'BTC'),
    spendableBitcoin: satToBtc(spendableAmount),
  };
}
