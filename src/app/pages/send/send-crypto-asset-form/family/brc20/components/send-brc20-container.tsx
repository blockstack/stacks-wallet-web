import { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

import { BtcFeeType } from '@shared/models/fees/bitcoin-fees.model';

interface SendBrc20ContextState {
  selectedFeeType: BtcFeeType | null;
  setSelectedFeeType(value: BtcFeeType | null): void;
}
export function useSendBrc20State() {
  const context = useOutletContext<SendBrc20ContextState>();
  return { ...context };
}

export function SendBrc20Container() {
  const [selectedFeeType, setSelectedFeeType] = useState(null);
  return <Outlet context={{ selectedFeeType, setSelectedFeeType }} />;
}
