import { atomFamily, atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';
import { makeLocalDataKey } from '@common/store-utils';
import { AccountStep } from './ui.models';

export const tabState = atomFamily<string, number, number>(param => {
  const anAtom = atomWithStorage<number>(makeLocalDataKey(['HOME_TABS', param]), 0);
  anAtom.debugLabel = `TABS__${param}`;
  return anAtom;
});

type LoadingState = 'idle' | 'loading';

export const loadingState = atomFamily<string, LoadingState, LoadingState>(_param => {
  const anAtom = atom<LoadingState>('idle');
  anAtom.debugLabel = `loading-atom/${_param}`;
  return anAtom;
});

export const accountDrawerStep = atom<AccountStep>(AccountStep.Switch);

// TODO: refactor into atom family
export const showAccountsStore = atom(false);

export const showNetworksStore = atom(false);

export const showSettingsStore = atom(false);
export const showTxSettingsStore = atom(false);
export const showTxSettingsCallback = atom<(() => Promise<void>) | undefined>(undefined);

export const errorStackTraceState = atom<string | null>(null);

accountDrawerStep.debugLabel = 'accountDrawerStep';
showAccountsStore.debugLabel = 'showAccountsStore';
showNetworksStore.debugLabel = 'showNetworksStore';
showSettingsStore.debugLabel = 'showSettingsStore';
