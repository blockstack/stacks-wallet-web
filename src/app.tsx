import React, { useEffect } from 'react';
import { ThemeProvider, ColorModeProvider } from '@stacks/ui';
import { Toaster } from 'react-hot-toast';

import { theme } from '@common/theme';
import { HashRouter as Router } from 'react-router-dom';
import { GlobalStyles } from 'styles/global-styles';
import { VaultLoader } from '@components/vault-loader';
import { AccountsDrawer } from '@features/accounts-drawer/accounts-drawer';
import { NetworksDrawer } from '@features/network-drawer/networks-drawer';
import { Routes } from './routes';

import { SettingsPopover } from '@features/settings-dropdown/settings-popover';
import { AppErrorBoundary } from '@features/errors/app-error-boundary';
import { TransactionSettingsDrawer } from '@features/fee-nonce-drawers/transaction-settings-drawer';
import { SpeedUpTransactionDrawer } from '@features/fee-nonce-drawers/speed-up-transaction-drawer';

export const App: React.FC = () => {
  useEffect(() => {
    (window as any).__APP_VERSION__ = VERSION;
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <ColorModeProvider defaultMode="light">
        <>
          <Router>
            <AppErrorBoundary>
              <VaultLoader />
              <Routes />
              <AccountsDrawer />
              <NetworksDrawer />
              <TransactionSettingsDrawer />
              <SpeedUpTransactionDrawer />
              <SettingsPopover />
            </AppErrorBoundary>
            <Toaster position="bottom-center" toastOptions={{ style: { fontSize: '14px' } }} />
          </Router>
        </>
      </ColorModeProvider>
    </ThemeProvider>
  );
};

export default App;
