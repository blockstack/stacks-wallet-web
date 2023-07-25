import { SupportedBlockchains } from '@shared/constants';

import { useLocationState } from '@app/common/hooks/use-location-state';

import { ConnectLedgerSuccessLayout } from './connect-ledger-success.layout';

export function ConnectLedgerSuccess() {
  const chain = useLocationState('chain') as SupportedBlockchains;
  return <ConnectLedgerSuccessLayout chain={chain} />;
}
