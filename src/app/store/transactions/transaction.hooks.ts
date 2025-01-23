import { useCallback, useMemo } from 'react';
import { useAsync } from 'react-async-hook';

import { bytesToHex } from '@stacks/common';
import { PostCondition, StacksTransactionWire, TransactionSigner } from '@stacks/transactions';
import {
  StacksTransaction,
  TransactionSigner as TransactionSignerV6,
  createStacksPrivateKey,
} from '@stacks/transactions-v6';
import BN from 'bn.js';

import { useNextNonce } from '@leather.io/query';
import { TransactionTypes, formatAssetString } from '@leather.io/stacks';
import { isUndefined, stxToMicroStx } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { StacksTransactionFormValues } from '@shared/models/form.model';

import { validateStacksAddress } from '@app/common/stacks-utils';
import {
  GenerateUnsignedTransactionOptions,
  generateUnsignedTransaction,
} from '@app/common/transactions/stacks/generate-unsigned-txs';
import { useWalletType } from '@app/common/use-wallet-type';
import {
  listenForStacksTxLedgerSigning,
  listenForStacksTxLedgerSigningV6,
} from '@app/features/ledger/flows/stacks-tx-signing/stacks-tx-signing-event-listeners';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import { useToast } from '@app/features/toasts/use-toast';
import {
  useCurrentStacksAccount,
  useCurrentStacksAccountAddress,
} from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';

import { usePostConditionState } from './post-conditions.hooks';
import { useTransactionRequestState } from './requests.hooks';

export function useTransactionPostConditions() {
  return usePostConditionState();
}

export function useUnsignedStacksTransactionBaseState() {
  const network = useCurrentStacksNetworkState();
  const stxAddress = useCurrentStacksAccountAddress();
  const { data: nextNonce } = useNextNonce(stxAddress);
  const payload = useTransactionRequestState();
  const postConditions = useTransactionPostConditions();
  const account = useCurrentStacksAccount();

  const options = useMemo(
    () => ({
      fee: 0,
      publicKey: account?.stxPublicKey,
      nonce: nextNonce?.nonce ?? 0,
      txData: { ...payload, postConditions, network },
    }),
    [account?.stxPublicKey, network, nextNonce?.nonce, payload, postConditions]
  );

  const transaction = useAsync(async () => {
    return generateUnsignedTransaction(options as GenerateUnsignedTransactionOptions);
  }, [account, nextNonce?.nonce, payload, stxAddress]).result;

  return useMemo(() => {
    if (!account || !payload || !stxAddress) return { transaction: undefined, options };
    if (
      payload.txType === TransactionTypes.ContractCall &&
      !validateStacksAddress(payload.contractAddress)
    ) {
      return { transaction: undefined, options };
    }

    return { transaction, options };
  }, [account, options, payload, stxAddress, transaction]);
}

export function useUnsignedPrepareTransactionDetails(values: StacksTransactionFormValues) {
  const unsignedStacksTransaction = useUnsignedStacksTransaction(values);
  return useMemo(() => unsignedStacksTransaction, [unsignedStacksTransaction]);
}

interface PostConditionsOptions {
  contractAddress: string;
  contractAssetName: string;
  contractName: string;
  stxAddress: string;
  amount: string | number;
}
export function makePostCondition(options: PostConditionsOptions): PostCondition {
  const { contractAddress, contractAssetName, contractName, stxAddress, amount } = options;

  return {
    type: 'ft-postcondition',
    address: stxAddress,
    condition: 'eq',
    amount: new BN(amount, 10).toString(),
    asset: formatAssetString({ contractAddress, contractName, assetName: contractAssetName }),
  };
}

export function useGenerateUnsignedStacksTransaction() {
  const stacksTxBaseState = useUnsignedStacksTransactionBaseState();
  const stxAddress = useCurrentStacksAccountAddress();
  const { data: nextNonce } = useNextNonce(stxAddress);

  return useCallback(
    (values: StacksTransactionFormValues) => {
      if (!stacksTxBaseState || isUndefined(nextNonce?.nonce)) return undefined;
      const { options } = stacksTxBaseState as any;
      return generateUnsignedTransaction({
        ...options,
        fee: stxToMicroStx(values.fee).toNumber(),
        nonce: Number(values.nonce) ?? nextNonce?.nonce,
      });
    },
    [nextNonce?.nonce, stacksTxBaseState]
  );
}

function useUnsignedStacksTransaction(values: StacksTransactionFormValues) {
  const generateTx = useGenerateUnsignedStacksTransaction();

  const tx = useAsync(async () => {
    return generateTx(values ?? undefined);
  }, [values]);

  return tx.result;
}

function useSignTransactionSoftwareWalletV6() {
  const toast = useToast();
  const account = useCurrentStacksAccount();

  return useCallback(
    (tx: StacksTransaction) => {
      if (account?.type !== 'software') {
        [toast.error, logger.error].forEach(fn =>
          fn('Cannot use this method to sign a non-software wallet transaction')
        );
        return;
      }
      if (!account) return null;
      const signer = new TransactionSignerV6(tx);
      signer.signOrigin(createStacksPrivateKey(account.stxPrivateKey));
      return tx;
    },
    [account, toast.error]
  );
}

function useSignTransactionSoftwareWallet() {
  const toast = useToast();
  const account = useCurrentStacksAccount();

  return useCallback(
    (tx: StacksTransactionWire) => {
      if (account?.type !== 'software') {
        [toast.error, logger.error].forEach(fn =>
          fn('Cannot use this method to sign a non-software wallet transaction')
        );
        return;
      }
      if (!account) return null;
      const signer = new TransactionSigner(tx);
      signer.signOrigin(account.stxPrivateKey);
      return tx;
    },
    [account, toast.error]
  );
}

export function useSignStacksTransactionV6() {
  const { whenWallet } = useWalletType();
  const ledgerNavigate = useLedgerNavigate();
  const signSoftwareTx = useSignTransactionSoftwareWalletV6();

  return (tx: StacksTransaction) =>
    whenWallet({
      async ledger(tx: StacksTransaction) {
        const serializedTx = tx.serialize();
        ledgerNavigate.toConnectAndSignStacksTransactionStep(bytesToHex(serializedTx));
        return listenForStacksTxLedgerSigningV6(bytesToHex(serializedTx));
      },
      async software(tx: StacksTransaction) {
        return signSoftwareTx(tx);
      },
    })(tx);
}

export function useSignStacksTransaction() {
  const { whenWallet } = useWalletType();
  const ledgerNavigate = useLedgerNavigate();
  const signSoftwareTx = useSignTransactionSoftwareWallet();

  return (tx: StacksTransactionWire) =>
    whenWallet({
      async ledger(tx: StacksTransactionWire) {
        const serializedTx = tx.serialize();
        ledgerNavigate.toConnectAndSignStacksTransactionStep(serializedTx);
        return listenForStacksTxLedgerSigning(serializedTx);
      },
      async software(tx: StacksTransactionWire) {
        return signSoftwareTx(tx);
      },
    })(tx);
}
