import { Suspense } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { LeatherQueryProvider } from '@leather-wallet/query';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistGate } from 'redux-persist/integration/react';

import { queryClient } from '@app/common/persistence';
import { ThemeSwitcherProvider } from '@app/common/theme-provider';
import { FullPageLoadingSpinner } from '@app/components/loading-spinner';
import { Devtools } from '@app/features/devtool/devtools';
import { AppErrorBoundary } from '@app/features/errors/app-error-boundary';
import { HeadProvider } from '@app/features/html-head/head-provider';
import { ToastsProvider } from '@app/features/toasts/toasts-provider';
import { AppRoutes } from '@app/routes/app-routes';
import { persistor, store } from '@app/store';

import './index.css';
import { useCurrentNetwork } from './store/networks/networks.selectors';
import { WALLET_ENVIRONMENT } from '@shared/environment';

const reactQueryDevToolsEnabled = process.env.REACT_QUERY_DEVTOOLS_ENABLED === 'true';

function ConnectedApp() {
  const network = useCurrentNetwork();
  return (
    <QueryClientProvider client={queryClient}>
      <LeatherQueryProvider
        client={queryClient}
        network={network}
        env={WALLET_ENVIRONMENT}
      >
        <Suspense fallback={<FullPageLoadingSpinner />}>
          <AppErrorBoundary>
            <AppRoutes />
          </AppErrorBoundary>
          {reactQueryDevToolsEnabled && <Devtools />}
        </Suspense>
      </LeatherQueryProvider>
    </QueryClientProvider>
  );
}

export function App() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<FullPageLoadingSpinner />} persistor={persistor}>
        <HeadProvider />
        <ToastsProvider>
          <ThemeSwitcherProvider>
            <ConnectedApp />
          </ThemeSwitcherProvider>
        </ToastsProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
