import { Suspense } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, ColorModeProvider } from '@stacks/ui';

import { queryClient } from '@app/common/persistence';
import { theme } from '@app/common/theme';
import { GlobalStyles } from '@app/components/global-styles/global-styles';
import { FullPageLoadingSpinner, NewAccountLoadingSpinner } from '@app/components/loading-spinner';
import { SwitchAccountDrawer } from '@app/features/switch-account-drawer/switch-account-drawer';
import { NetworksDrawer } from '@app/features/network-drawer/networks-drawer';
import { SettingsDropdown } from '@app/features/settings-dropdown/settings-dropdown';
import { AppErrorBoundary } from '@app/features/errors/app-error-boundary';
import { Devtools } from '@app/features/devtool/devtools';
import { AppRoutes } from '@app/routes/app-routes';
import { persistor, store } from '@app/store';

const reactQueryDevToolsEnabled = process.env.REACT_QUERY_DEVTOOLS_ENABLED === 'true';

export function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<FullPageLoadingSpinner />} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <QueryClientProvider client={queryClient}>
            <ColorModeProvider defaultMode="light">
              <Suspense fallback={<NewAccountLoadingSpinner />}>
                <Router>
                  <AppErrorBoundary>
                    <AppRoutes />
                    <SwitchAccountDrawer />
                    <NetworksDrawer />
                    <SettingsDropdown />
                  </AppErrorBoundary>
                  <Toaster
                    position="bottom-center"
                    toastOptions={{ style: { fontSize: '14px' } }}
                  />
                </Router>
                {reactQueryDevToolsEnabled && <Devtools />}
              </Suspense>
            </ColorModeProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
