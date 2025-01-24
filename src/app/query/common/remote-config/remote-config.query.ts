import { useMemo } from 'react';

import { useRemoteConfig } from '@leather.io/query';
import { getPrincipalFromAssetString } from '@leather.io/stacks';

import { useWalletType } from '@app/common/use-wallet-type';
import { useHasCurrentBitcoinAccount } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

export {
  ActiveFiatProvider,
  AvailableRegions,
  HiroMessage,
  useActiveFiatProviders,
  useConfigNftMetadataEnabled,
  useConfigRunesEnabled,
  useConfigSwapsEnabled,
  useHasFiatProviders,
  useRecoverUninscribedTaprootUtxosFeatureEnabled,
  useRemoteLeatherMessages,
} from '@leather.io/query';

export function useConfigBitcoinEnabled() {
  const { whenWallet } = useWalletType();
  const config = useRemoteConfig();
  const hasBitcoinAccount = useHasCurrentBitcoinAccount();
  return whenWallet({
    ledger: (config?.bitcoinEnabled ?? true) && hasBitcoinAccount,
    software: config?.bitcoinEnabled ?? true,
  });
}

export function useConfigBitcoinSendEnabled() {
  const { whenWallet } = useWalletType();
  const config = useRemoteConfig();
  const hasBitcoinAccount = useHasCurrentBitcoinAccount();
  return whenWallet({
    ledger: config?.bitcoinSendEnabled && hasBitcoinAccount,
    software: config?.bitcoinSendEnabled ?? true,
  });
}

// Update in mono repo
interface SbtcConfig {
  enabled: boolean;
  contracts: Record<'mainnet' | 'testnet', { address: string }>;
  emilyApiUrl: string;
  sponsorshipApiUrl: {
    mainnet: string;
    testnet: string;
  };
  swapsEnabled: boolean;
  sponsorshipsEnabled: boolean;
}

export function useConfigSbtc() {
  const config = useRemoteConfig();
  const network = useCurrentNetwork();
  const sbtc = config?.sbtc as SbtcConfig;

  return useMemo(() => {
    const displayPromoCardOnNetworks = (sbtc as any)?.showPromoLinkOnNetworks ?? [];
    const contractIdMainnet = sbtc?.contracts.mainnet.address ?? '';
    const contractIdTestnet = sbtc?.contracts.testnet.address ?? '';
    const apiUrlMainnet = sbtc?.sponsorshipApiUrl.mainnet ?? '';
    const apiUrlTestnet = sbtc?.sponsorshipApiUrl.testnet ?? '';

    return {
      configLoading: !sbtc,
      isSbtcEnabled: sbtc?.enabled ?? false,
      isSbtcSponsorshipsEnabled: (sbtc?.enabled && sbtc?.sponsorshipsEnabled) ?? false,
      emilyApiUrl: sbtc?.emilyApiUrl ?? '',
      contractId: network.chain.bitcoin.mode === 'mainnet' ? contractIdMainnet : contractIdTestnet,
      sponsorshipApiUrl: network.chain.bitcoin.mode === 'mainnet' ? apiUrlMainnet : apiUrlTestnet,
      isSbtcContract(contract: string) {
        return (
          contract === getPrincipalFromAssetString(contractIdMainnet) ||
          contract === getPrincipalFromAssetString(contractIdTestnet)
        );
      },
      shouldDisplayPromoCard: displayPromoCardOnNetworks.includes(network.id),
    };
  }, [network.chain.bitcoin.mode, network.id, sbtc]);
}
