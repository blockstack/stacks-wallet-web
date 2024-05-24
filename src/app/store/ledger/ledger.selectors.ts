import { useSelector } from 'react-redux';

import { sumNumbers } from '@leather-wallet/utils';
import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '..';

const selectLedger = (state: RootState) => state.ledger;

const selectNumberOfLedgerKeysPersisted = createSelector(selectLedger, ledger =>
  sumNumbers(Object.values(ledger).map(chain => Object.keys(chain.entities).length))
);

function useNumberOfLedgerKeysPersisted() {
  return useSelector(selectNumberOfLedgerKeysPersisted);
}

export function useHasLedgerKeys() {
  return useNumberOfLedgerKeysPersisted().isGreaterThan(0);
}

export function useLedgerDeviceTargetId() {
  return useSelector(
    (state: RootState) =>
      state.ledger.stacks.entities[0]?.targetId || state.ledger.bitcoin.entities[0]?.targetId || ''
  );
}
