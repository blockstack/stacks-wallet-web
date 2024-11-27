import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { bytesToHex } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';
import type { P2TROut } from '@scure/btc-signer/payment';
import {
  MAINNET,
  REGTEST,
  SbtcApiClientMainnet,
  SbtcApiClientTestnet,
  TESTNET,
  buildSbtcDepositTx,
} from 'sbtc';

import type { BitcoinNetworkModes } from '@leather.io/models';
import { useAverageBitcoinFeeRates } from '@leather.io/query';
import { btcToSat, createMoney } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';

import { LoadingKeys, useLoading } from '@app/common/hooks/use-loading';
import {
  determineUtxosForSpend,
  determineUtxosForSpendAll,
} from '@app/common/transactions/bitcoin/coinselect/local-coin-selection';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/address/utxos-by-address.hooks';
import { useBreakOnNonCompliantEntity } from '@app/query/common/compliance-checker/compliance-checker.query';
import { useBitcoinScureLibNetworkConfig } from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';
import { useCurrentAccountNativeSegwitIndexZeroSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import type { SwapSubmissionData } from '../swap.context';

// Also set as defaults in sbtc lib
const maxSignerFee = 80_000;
const reclaimLockTime = 144;

interface SbtcDeposit {
  address: string;
  depositScript: string;
  reclaimScript: string;
  transaction: btc.Transaction;
  trOut: P2TROut;
}

function getSbtcNetworkConfig(network: BitcoinNetworkModes) {
  const networkMap = {
    mainnet: MAINNET,
    testnet: TESTNET,
    regtest: REGTEST,
    // Signet supported not tested, but likely uses same values as testnet
    signet: TESTNET,
  };
  return networkMap[network];
}

const clientMainnet = new SbtcApiClientMainnet();
const clientTestnet = new SbtcApiClientTestnet();

export function useSbtcDepositTransaction() {
  const toast = useToast();
  const { setIsIdle } = useLoading(LoadingKeys.SUBMIT_SWAP_TRANSACTION);
  const stacksAccount = useCurrentStacksAccount();
  const { data: utxos } = useCurrentNativeSegwitUtxos();
  const { data: feeRates } = useAverageBitcoinFeeRates();
  const signer = useCurrentAccountNativeSegwitIndexZeroSigner();
  const networkMode = useBitcoinScureLibNetworkConfig();
  const navigate = useNavigate();
  const network = useCurrentNetwork();

  const client = useMemo(
    () => (network.chain.bitcoin.mode === 'mainnet' ? clientMainnet : clientTestnet),
    [network]
  );

  // Check if the signer is compliant
  useBreakOnNonCompliantEntity();

  return {
    async onReviewDepositSbtc(swapData: SwapSubmissionData, isSendingMax: boolean) {
      if (!stacksAccount || !utxos) return;

      try {
        const deposit: SbtcDeposit = buildSbtcDepositTx({
          amountSats: btcToSat(swapData.swapAmountQuote).toNumber(),
          network: getSbtcNetworkConfig(network.chain.bitcoin.mode),
          stacksAddress: stacksAccount.address,
          signersPublicKey: await client.fetchSignersPublicKey(),
          maxSignerFee,
          reclaimLockTime,
          reclaimPublicKey: bytesToHex(signer.publicKey).slice(2),
        });

        const determineUtxosArgs = {
          feeRate: feeRates?.halfHourFee.toNumber() ?? 0,
          recipients: [
            {
              address: deposit.address,
              amount: createMoney(Number(deposit.transaction.getOutput(0).amount), 'BTC'),
            },
          ],
          utxos,
        };

        const { inputs, outputs, fee } = isSendingMax
          ? determineUtxosForSpendAll(determineUtxosArgs)
          : determineUtxosForSpend(determineUtxosArgs);

        const p2wpkh = btc.p2wpkh(signer.publicKey, networkMode);

        for (const input of inputs) {
          deposit.transaction.addInput({
            txid: input.txid,
            index: input.vout,
            sequence: 0,
            witnessUtxo: {
              // script = 0014 + pubKeyHash
              script: p2wpkh.script,
              amount: BigInt(input.value),
            },
          });
        }

        outputs.forEach(output => {
          // Add change output
          if (!output.address) {
            deposit.transaction.addOutputAddress(signer.address, BigInt(output.value), networkMode);
            return;
          }
        });

        return { deposit, fee, maxSignerFee };
      } catch (error) {
        logger.error('Error generating deposit transaction', error);
        return null;
      }
    },
    async onDepositSbtc(swapSubmissionData: SwapSubmissionData) {
      if (!stacksAccount) return;
      const sBtcDeposit = swapSubmissionData.txData?.deposit as SbtcDeposit;

      try {
        signer.sign(sBtcDeposit.transaction);
        sBtcDeposit.transaction.finalize();
        logger.info('Deposit', { deposit: sBtcDeposit });

        const txid = await client.broadcastTx(sBtcDeposit.transaction);
        logger.info('Broadcasted tx', txid);

        await client.notifySbtc(sBtcDeposit);
        toast.success('Transaction submitted!');
        setIsIdle();
        navigate(RouteUrls.Activity);
      } catch (error) {
        setIsIdle();
        logger.error(`Deposit error: ${error}`);
      } finally {
        setIsIdle();
      }
    },
  };
}
