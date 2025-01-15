import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { StacksTransaction } from '@stacks/transactions';
import { Formik, FormikHelpers } from 'formik';
import { Flex } from 'leather-styles/jsx';
import * as yup from 'yup';

import { HIGH_FEE_WARNING_LEARN_MORE_URL_STX } from '@leather.io/constants';
import { FeeTypes } from '@leather.io/models';
import {
  defaultStacksFees,
  useCalculateStacksTxFees,
  useNextNonce,
  useStxCryptoAssetBalance,
} from '@leather.io/query';
import { Link } from '@leather.io/ui';
import { stxToMicroStx } from '@leather.io/utils';

import { StacksTransactionFormValues } from '@shared/models/form.model';
import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { stxFeeValidator } from '@app/common/validation/forms/fee-validators';
import { nonceValidator } from '@app/common/validation/nonce-validators';
import { NonceSetter } from '@app/components/nonce-setter';
import { RequestingTabClosedWarningMessage } from '@app/features/errors/requesting-tab-closed-error-msg';
import { ContractCallDetails } from '@app/features/stacks-transaction-request/contract-call-details/contract-call-details';
import { ContractDeployDetails } from '@app/features/stacks-transaction-request/contract-deploy-details/contract-deploy-details';
import { PageTop } from '@app/features/stacks-transaction-request/page-top';
import { PostConditionModeWarning } from '@app/features/stacks-transaction-request/post-condition-mode-warning';
import { PostConditions } from '@app/features/stacks-transaction-request/post-conditions/post-conditions';
import { StxTransferDetails } from '@app/features/stacks-transaction-request/stx-transfer-details/stx-transfer-details';
import { TransactionError } from '@app/features/stacks-transaction-request/transaction-error/transaction-error';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useTransactionRequestState } from '@app/store/transactions/requests.hooks';

import { HighFeeSheet } from '../stacks-high-fee-warning/stacks-high-fee-dialog';
import { FeeForm } from './fee-form';
import { MinimalErrorMessage } from './minimal-error-message';
import { StacksTxSubmitAction } from './submit-action';

interface StacksTransactionSignerProps {
  stacksTransaction?: StacksTransaction;
  disableFeeSelection?: boolean;
  disableNonceSelection?: boolean;
  isMultisig: boolean;
  onCancel(): void;
  onSignStacksTransaction(fee: number, nonce: number): Promise<void>;
}
export function StacksTransactionSigner({
  stacksTransaction,
  disableFeeSelection,
  disableNonceSelection,
  onSignStacksTransaction,
  isMultisig,
}: StacksTransactionSignerProps) {
  const transactionRequest = useTransactionRequestState();
  const { data: stxFees } = useCalculateStacksTxFees(stacksTransaction);

  const stxAddress = useCurrentStacksAccountAddress();
  const { filteredBalanceQuery } = useStxCryptoAssetBalance(stxAddress);
  const availableUnlockedBalance = filteredBalanceQuery.data?.availableUnlockedBalance;
  const navigate = useNavigate();
  const { data: nextNonce, status: nonceQueryStatus } = useNextNonce(stxAddress);
  const canSubmit = filteredBalanceQuery.status === 'success' && nonceQueryStatus === 'success';

  const { search } = useLocation();

  useOnMount(() => {
    void analytics.track('view_transaction_signing'), [];
  });

  async function onSubmit(
    values: StacksTransactionFormValues,
    formikHelpers: FormikHelpers<StacksTransactionFormValues>
  ) {
    formikHelpers.setSubmitting(true);
    await onSignStacksTransaction(stxToMicroStx(values.fee).toNumber(), Number(values.nonce));
    formikHelpers.setSubmitting(false);
  }

  if (!transactionRequest) return null;

  const validationSchema =
    !transactionRequest.sponsored && !disableFeeSelection && !isMultisig
      ? yup.object({
          fee: stxFeeValidator(availableUnlockedBalance),
          nonce: nonceValidator,
        })
      : yup.object({
          nonce: nonceValidator,
        });

  const isNonceAlreadySet = !Number.isNaN(transactionRequest.nonce);

  const initialValues: StacksTransactionFormValues = {
    fee: '',
    feeCurrency: 'STX',
    feeType: FeeTypes[FeeTypes.Middle],
    nonce: isNonceAlreadySet ? transactionRequest.nonce : nextNonce?.nonce,
  };

  return (
    <Flex alignItems="center" flexDirection="column" p="space.05" width="100%">
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        validateOnMount={false}
        validationSchema={validationSchema}
      >
        {() => (
          <>
            <PageTop />
            <RequestingTabClosedWarningMessage />
            <PostConditionModeWarning />
            <TransactionError />
            <PostConditions />
            {transactionRequest.txType === 'contract_call' && <ContractCallDetails />}
            {transactionRequest.txType === 'token_transfer' && <StxTransferDetails />}
            {transactionRequest.txType === 'smart_contract' && <ContractDeployDetails />}

            {!isNonceAlreadySet && <NonceSetter />}
            <FeeForm
              fees={stxFees ?? defaultStacksFees}
              sbtcSponsorshipEligibility={{ isEligible: false }}
              defaultFeeValue={Number(transactionRequest?.fee || 0)}
              disableFeeSelection={disableFeeSelection}
            />
            {!disableNonceSelection && (
              <Link
                alignSelf="flex-end"
                my="space.04"
                onClick={() => navigate(RouteUrls.EditNonce + search)}
              >
                Edit nonce
              </Link>
            )}
            <MinimalErrorMessage />
            <StacksTxSubmitAction canSubmit={canSubmit} />
            <HighFeeSheet learnMoreUrl={HIGH_FEE_WARNING_LEARN_MORE_URL_STX} />
            <Outlet />
          </>
        )}
      </Formik>
    </Flex>
  );
}
