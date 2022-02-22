import {
  createWalletGaiaConfig,
  generateNewAccount,
  updateWalletConfig,
  Wallet,
} from '@stacks/wallet-sdk';

import { gaiaUrl } from '@shared/constants';
import { logger } from '@shared/logger';
import { saveWalletConfigLocally } from '@shared/utils/wallet-config-helper';
import { selectCurrentKey } from '@app/store/keys/key.selectors';
import { AppThunk } from '@app/store';
import { stxChainSlice } from './stx-chain.slice';

export const createNewAccount = (wallet: Wallet): AppThunk => {
  return async (dispatch, getState) => {
    const currentKey = selectCurrentKey(getState());
    if (!currentKey) return;
    const { secretKey } = currentKey;
    if (!secretKey) {
      throw new Error('Unable to create a new account - not logged in.');
    }
    const newWallet = generateNewAccount(wallet);
    // Attempt to update gaia config with new account information
    // If Gaia fails, return new account information anyway
    try {
      const updateConfig = async () => {
        const gaiaHubConfig = await createWalletGaiaConfig({ gaiaHubUrl: gaiaUrl, wallet });
        const walletConfig = await updateWalletConfig({ wallet: newWallet, gaiaHubConfig });
        // The gaia wallet config is saved locally so we don't have
        // to fetch it again from gaia on wallet unlock
        saveWalletConfigLocally(walletConfig);
      };
      await updateConfig();
    } catch (e) {
      logger.error('Unable to update Gaia profile', e);
    }
    dispatch(stxChainSlice.actions.createNewAccount());
  };
};

export const stxChainActions = stxChainSlice.actions;
