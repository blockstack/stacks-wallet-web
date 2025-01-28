import { bytesToHex } from '@stacks/common';
import { StacksTransactionWire } from '@stacks/transactions';
import { StacksTransaction } from '@stacks/transactions-v6';
import axios from 'axios';

import { logger } from '@shared/logger';

import { queryClient } from '@app/common/persistence';
import { generateUnsignedTransaction } from '@app/common/transactions/stacks/generate-unsigned-txs';
import { generateStacksContractCallUnsignedTxV6 } from '@app/store/transactions/contract-call-v6';

export interface TransactionBaseV6 {
  options?: any;
  transaction: StacksTransaction | undefined;
}

export interface TransactionBase {
  options?: any;
  transaction: StacksTransactionWire | undefined;
}

export interface SbtcSponsorshipEligibilityV6 {
  isEligible: boolean;
  unsignedSponsoredTx?: StacksTransaction;
}

export interface SbtcSponsorshipEligibility {
  isEligible: boolean;
  unsignedSponsoredTx?: StacksTransactionWire;
}

export interface SbtcSponsorshipVerificationResult {
  isVerifying: boolean;
  result: SbtcSponsorshipEligibility | undefined;
}

interface SbtcSponsorshipSubmissionResult {
  txid?: string;
  error?: string;
}

export async function submitSponsoredSbtcTransactionV6(
  apiUrl: string,
  sponsoredTx: StacksTransaction
): Promise<SbtcSponsorshipSubmissionResult> {
  try {
    const { data } = await axios.post(`${apiUrl}/submit`, {
      tx: sponsoredTx.serialize(),
    });
    return {
      txid: data.txid,
    };
  } catch (error: any) {
    const errMsg = `sBTC Sponsorship Failure (${error?.response?.data?.error || 'Unknown'})`;
    return {
      error: errMsg,
    };
  }
}

export async function submitSponsoredSbtcTransaction(
  apiUrl: string,
  sponsoredTx: StacksTransactionWire
): Promise<SbtcSponsorshipSubmissionResult> {
  try {
    const { data } = await axios.post(`${apiUrl}/submit`, {
      tx: sponsoredTx.serialize(),
    });
    return {
      txid: data.txid,
    };
  } catch (error: any) {
    const errMsg = `sBTC Sponsorship Failure (${error?.response?.data?.error || 'Unknown'})`;
    return {
      error: errMsg,
    };
  }
}

interface VerifySponsoredSbtcTransactionV6Args {
  apiUrl: string;
  baseTx: TransactionBaseV6;
  nonce?: number;
  fee?: number;
}
export async function verifySponsoredSbtcTransactionV6({
  apiUrl,
  baseTx,
  nonce,
  fee,
}: VerifySponsoredSbtcTransactionV6Args): Promise<SbtcSponsorshipEligibilityV6> {
  try {
    const { options } = baseTx as any;
    options.sponsored = true;

    const sponsoredTx = await generateStacksContractCallUnsignedTxV6(options, { fee, nonce });
    const serializedTx = bytesToHex(sponsoredTx.serialize());

    const result = await queryClient.fetchQuery({
      queryKey: ['verify-sponsored-sbtc-transaction', serializedTx],
      queryFn: async () => {
        const { data } = await axios.post(
          `${apiUrl}/verify`,
          {
            tx: serializedTx,
          },
          { timeout: 5000 }
        );
        return data;
      },
    });

    return { isEligible: result, unsignedSponsoredTx: sponsoredTx };
  } catch (error) {
    logger.error('Transaction verification failed:', error);
    return { isEligible: false };
  }
}

interface VerifySponsoredSbtcTransactionArgs {
  apiUrl: string;
  baseTx: TransactionBase;
  nonce?: number;
  fee?: number;
}
export async function verifySponsoredSbtcTransaction({
  apiUrl,
  baseTx,
  nonce,
  fee,
}: VerifySponsoredSbtcTransactionArgs): Promise<SbtcSponsorshipEligibility> {
  try {
    const { options } = baseTx as any;
    options.txData.sponsored = true;
    const sponsoredTx = await generateUnsignedTransaction({
      ...options,
      fee,
      nonce,
    });
    const serializedTx = sponsoredTx.serialize();

    const result = await queryClient.fetchQuery({
      queryKey: ['verify-sponsored-sbtc-transaction', serializedTx],
      queryFn: async () => {
        const { data } = await axios.post(
          `${apiUrl}/verify`,
          {
            tx: serializedTx,
          },
          { timeout: 5000 }
        );
        return data;
      },
    });

    return { isEligible: result, unsignedSponsoredTx: sponsoredTx };
  } catch (error) {
    logger.error('Transaction verification failed:', error);
    return { isEligible: false };
  }
}
