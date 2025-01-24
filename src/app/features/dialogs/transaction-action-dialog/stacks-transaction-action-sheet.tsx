import { Suspense } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import { yupResolver } from '@hookform/resolvers/yup';
import type { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';
import type { StacksTransactionWire } from '@stacks/transactions';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { Flex, Stack } from 'leather-styles/jsx';

import {
  useGetTransactionByIdQuery,
  useStacksRawTransaction,
  useStxAvailableUnlockedBalance,
} from '@leather.io/query';
import { Caption, Sheet, SheetHeader, Spinner } from '@leather.io/ui';
import { microStxToStx, stxToMicroStx } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { stacksValue } from '@app/common/stacks-utils';
import { StacksTransactionActionType } from '@app/common/transactions/stacks/transaction.utils';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { StacksTransactionItem } from '@app/components/stacks-transaction-item/stacks-transaction-item';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { IncreaseFeeField } from './components/increase-fee-field';
import { TransactionActions } from './components/transaction-actions';
import { useStacksTransactionAction } from './hooks/use-stacks-transaction-action';

interface StacksTransactionActionSheetProps {
  description: string;
  routeUrl: string;
  title: string;
  actionType: StacksTransactionActionType;
  txid: string;
  rawTx: StacksTransactionWire;
  tx: MempoolTransaction | Transaction;
}

interface StacksTransactionActionSheetLoaderProps {
  children(args: {
    txid: string;
    rawTx: StacksTransactionWire;
    tx: MempoolTransaction | Transaction;
  }): React.ReactNode;
}

export function StacksTransactionActionSheetLoader({
  children,
}: StacksTransactionActionSheetLoaderProps) {
  const { txid } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  if (!txid) throw new Error('Transaction id should be provided');

  const { isLoadingRawTx, rawTx } = useStacksRawTransaction(txid);
  const { data: tx, isLoading: isLoadingTx } = useGetTransactionByIdQuery(txid);

  if (isLoadingRawTx || isLoadingTx) return <LoadingSpinner />;

  if (!rawTx || !tx) {
    toast.error('Transaction not found');
    navigate(RouteUrls.Home);
    return null;
  }

  return children({ txid, rawTx, tx });
}

export function StacksTransactionActionSheet({
  txid,
  rawTx,
  tx,
  title,
  description,
  routeUrl,
  actionType,
}: StacksTransactionActionSheetProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const StacksAddress = useCurrentStacksAccountAddress();
  const availableUnlockedBalance = useStxAvailableUnlockedBalance(StacksAddress);

  const { onSubmit, validationSchema, isBroadcasting } = useStacksTransactionAction({
    actionType,
    txid,
  });

  const initialTransactionFee = Number(rawTx.auth.spendingCondition?.fee);

  const isCancelTransactionAction = actionType === 'cancel';

  const modifiedInitialTransactionFee = isCancelTransactionAction
    ? initialTransactionFee + 1
    : initialTransactionFee;

  const methods = useForm({
    resolver: yupResolver(validationSchema, {
      stripUnknown: true,
    }),
    defaultValues: {
      fee: microStxToStx(modifiedInitialTransactionFee).toNumber(),
    },
  });

  const feeValue = methods.watch('fee');
  return (
    <FormProvider {...methods}>
      <Sheet
        isShowing={location.pathname === routeUrl.replace(':txid', txid)}
        onClose={() => navigate(RouteUrls.Home)}
        header={<SheetHeader title={title} />}
        footer={
          <TransactionActions
            isDisabled={stxToMicroStx(feeValue ?? 0).isLessThanOrEqualTo(initialTransactionFee)}
            isLoading={isBroadcasting}
            onCancel={() => navigate(RouteUrls.Home)}
            onSubmit={methods.handleSubmit(onSubmit)}
          />
        }
      >
        <Stack
          gap="space.05"
          px="space.05"
          pb="space.05"
          data-testid={`${ActivitySelectors.TransactionActionSheet}-${actionType}`}
        >
          <Suspense
            fallback={
              <Flex alignItems="center" justifyContent="center" p="space.06">
                <Spinner />
              </Flex>
            }
          >
            <Caption>{description}</Caption>
            <Stack gap="space.06">
              {tx && <StacksTransactionItem transaction={tx} />}
              <Stack gap="space.04">
                <IncreaseFeeField initialFee={initialTransactionFee} />
                {availableUnlockedBalance?.amount && (
                  <Caption>
                    Balance:{' '}
                    {stacksValue({
                      value: availableUnlockedBalance.amount,
                      fixedDecimals: true,
                    })}
                  </Caption>
                )}
              </Stack>
            </Stack>
          </Suspense>
        </Stack>
      </Sheet>

      <Outlet />
    </FormProvider>
  );
}
