import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { keySlice } from '../keys/key.slice';
import { RootState } from '../root-reducer';

interface StxChainKeyState {
  highestAccountIndex: number;
  currentAccountIndex: number;
}

const initialState: Record<string, StxChainKeyState> = {
  default: {
    highestAccountIndex: 0,
    currentAccountIndex: 0,
  },
};

export const stxChainSlice = createSlice({
  name: 'stxChain',
  initialState,
  reducers: {
    switchAccount(state, action: PayloadAction<number>) {
      state.default.currentAccountIndex = action.payload;
    },
    createNewAccount(state) {
      state.default.highestAccountIndex += 1;
      state.default.currentAccountIndex = state.default.highestAccountIndex;
    },
    restoreAccountIndex(state, action: PayloadAction<number>) {
      state.default.highestAccountIndex = action.payload;
    },
  },
  extraReducers: {
    [keySlice.actions.signOut.toString()]: state => {
      state.default.highestAccountIndex = 0;
      state.default.currentAccountIndex = 0;
    },
  },
});

export const selectStxChain = (state: RootState) => state.chains.stx;
