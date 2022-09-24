import { useDispatch, useSelector } from 'react-redux';
import { atomWithStore } from 'jotai/redux';
import { devToolsEnhancer } from '@redux-devtools/remote';
import { AnyAction, combineReducers, configureStore, ThunkAction } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import { IS_DEV_ENV } from '@shared/environment';

import { keySlice } from './keys/key.slice';
import { stxChainSlice } from './chains/stx-chain.slice';
import { broadcastActionTypeToOtherFramesMiddleware } from './utils/broadcast-action-types';
import { inMemoryKeySlice } from './in-memory-key/in-memory-key.slice';
import { ExtensionStorage } from './utils/extension-storage';
import { onboardingSlice } from './onboarding/onboarding.slice';
import { analyticsSlice } from './analytics/analytics.slice';
import { submittedTransactionsSlice } from './submitted-transactions/submitted-transactions.slice';
import { networksSlice } from './networks/networks.slice';

const storage = new ExtensionStorage(chrome.storage.local, chrome.runtime);

const rootReducer = combineReducers({
  analytics: analyticsSlice.reducer,
  chains: combineReducers({
    stx: stxChainSlice.reducer,
  }),
  inMemoryKeys: inMemoryKeySlice.reducer,
  keys: keySlice.reducer,
  networks: networksSlice.reducer,
  onboarding: onboardingSlice.reducer,
  submittedTransactions: submittedTransactionsSlice.reducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  serialize: true,
  whitelist: ['analytics', 'chains', 'keys', 'networks', 'onboarding'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => [
    ...getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
    broadcastActionTypeToOtherFramesMiddleware,
  ],
  enhancers: IS_DEV_ENV
    ? [
        devToolsEnhancer({
          hostname: 'localhost',
          port: 8000,
          realtime: true,
        }),
      ]
    : [],
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof persistedReducer>;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>;

type AppDispatch = typeof store.dispatch & ((action: AppThunk) => void);

export const useAppDispatch: () => AppDispatch = useDispatch;

export const storeAtom = atomWithStore(store);

const selectHasRehydrated = (state: RootState) => state._persist.rehydrated;

export function useHasStateRehydrated() {
  return useSelector(selectHasRehydrated);
}
