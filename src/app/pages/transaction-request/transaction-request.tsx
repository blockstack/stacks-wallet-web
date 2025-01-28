import { memo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { Formik, FormikHelpers } from 'formik';
import { Flex } from 'leather-styles/jsx';
import * as yup from 'yup';

import { HIGH_FEE_WARNING_LEARN_MORE_URL_STX } from '@leather.io/constants';
import { FeeTypes } from '@leather.io/models';
import {
  useCalculateStacksTxFees,
  useNextNonce,
  useStxCryptoAssetBalance,
} from '@leather.io/query';
import { Link } from '@leather.io/ui';
import { isString } from '@leather.io/utils';

import { finalizeTxSignature } from '@shared/actions/finalize-tx-signature';
import { logger } from '@shared/logger';
import { StacksTransactionFormValues } from '@shared/models/form.model';
import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { useOnMount } from '@app/common/hooks/use-on-mount';
import { stacksTransactionToHex } from '@app/common/transactions/stacks/transaction.utils';
import { stxFeeValidator } from '@app/common/validation/forms/fee-validators';
import { nonceValidator } from '@app/common/validation/nonce-validators';
import { NonceSetter } from '@app/components/nonce-setter';
import { PopupHeader } from '@app/features/container/headers/popup.header';
import { RequestingTabClosedWarningMessage } from '@app/features/errors/requesting-tab-closed-error-msg';
import { HighFeeSheet } from '@app/features/stacks-high-fee-warning/stacks-high-fee-dialog';
import { ContractCallDetails } from '@app/features/stacks-transaction-request/contract-call-details/contract-call-details';
import { ContractDeployDetails } from '@app/features/stacks-transaction-request/contract-deploy-details/contract-deploy-details';
import { FeeForm } from '@app/features/stacks-transaction-request/fee-form';
import { useStacksBroadcastTransaction } from '@app/features/stacks-transaction-request/hooks/use-stacks-broadcast-transaction';
import { MinimalErrorMessage } from '@app/features/stacks-transaction-request/minimal-error-message';
import { PageTop } from '@app/features/stacks-transaction-request/page-top';
import { PostConditionModeWarning } from '@app/features/stacks-transaction-request/post-condition-mode-warning';
import { PostConditions } from '@app/features/stacks-transaction-request/post-conditions/post-conditions';
import { StxTransferDetails } from '@app/features/stacks-transaction-request/stx-transfer-details/stx-transfer-details';
import { StacksTxSubmitAction } from '@app/features/stacks-transaction-request/submit-action';
import { TransactionError } from '@app/features/stacks-transaction-request/transaction-error/transaction-error';
import { useConfigSbtc } from '@app/query/common/remote-config/remote-config.query';
import { useCheckSbtcSponsorshipEligible } from '@app/query/sbtc/sponsored-transactions.hooks';
import { submitSponsoredSbtcTransaction } from '@app/query/sbtc/sponsored-transactions.query';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import {
  useTransactionRequest,
  useTransactionRequestState,
} from '@app/store/transactions/requests.hooks';
import {
  useGenerateUnsignedStacksTransaction,
  useSignStacksTransaction,
  useUnsignedStacksTransactionBaseState,
} from '@app/store/transactions/transaction.hooks';

function TransactionRequestBase() {
  const sbtcConfig = useConfigSbtc();
  const { tabId } = useDefaultRequestParams();
  const requestToken = useTransactionRequest();

  const transactionRequest = useTransactionRequestState();
  const unsignedTx = useUnsignedStacksTransactionBaseState();
  const { data: stxFees } = useCalculateStacksTxFees(unsignedTx.transaction);
  const generateUnsignedTx = useGenerateUnsignedStacksTransaction();
  const stxAddress = useCurrentStacksAccountAddress();

  const { filteredBalanceQuery } = useStxCryptoAssetBalance(stxAddress);
  const availableUnlockedBalance = filteredBalanceQuery.data?.availableUnlockedBalance;

  const { data: nextNonce, status: nonceQueryStatus } = useNextNonce(stxAddress);

  const { isVerifying: isVerifyingSbtcSponsorship, result: sbtcSponsorshipEligibility } =
    useCheckSbtcSponsorshipEligible(unsignedTx, nextNonce, stxFees);

  const canSubmit =
    filteredBalanceQuery.status === 'success' &&
    nonceQueryStatus === 'success' &&
    !isVerifyingSbtcSponsorship;

  const navigate = useNavigate();
  const { stacksBroadcastTransaction } = useStacksBroadcastTransaction({ token: 'STX' });
  const signStacksTransaction = useSignStacksTransaction();

  useOnMount(() => void analytics.track('view_transaction_signing'));

  async function onSubmit(
    values: StacksTransactionFormValues,
    formikHelpers: FormikHelpers<StacksTransactionFormValues>
  ) {
    formikHelpers.setSubmitting(true);
    if (sbtcSponsorshipEligibility?.isEligible) {
      try {
        const signedSponsoredTx = await signStacksTransaction(
          sbtcSponsorshipEligibility.unsignedSponsoredTx!
        );
        if (!signedSponsoredTx) throw new Error('Unable to sign sponsored transaction!');
        const result = await submitSponsoredSbtcTransaction(
          sbtcConfig.sponsorshipApiUrl,
          signedSponsoredTx
        );
        if (!result.txid) {
          navigate(RouteUrls.TransactionBroadcastError, { state: { message: result.error } });
          return;
        }
        if (requestToken && tabId) {
          finalizeTxSignature({
            requestPayload: requestToken,
            tabId: tabId,
            data: {
              txRaw: stacksTransactionToHex(signedSponsoredTx),
              txId: result.txid,
            },
          });
        }
      } catch (e: any) {
        const message = isString(e) ? e : e.message;
        navigate(RouteUrls.TransactionBroadcastError, { state: { message } });
      }
    } else {
      const unsignedTx = await generateUnsignedTx(values);

      if (!unsignedTx)
        return logger.error('Failed to generate unsigned transaction in transaction-request');

      await stacksBroadcastTransaction(unsignedTx);
    }

    void analytics.track('submit_fee_for_transaction', {
      calculation: stxFees?.calculation || 'unknown',
      fee: values.fee,
      type: values.feeType,
    });
    formikHelpers.setSubmitting(false);
  }

  if (!transactionRequest) return null;

  const validationSchema = !transactionRequest.sponsored
    ? yup.object({
        fee: stxFeeValidator(availableUnlockedBalance),
        nonce: nonceValidator,
      })
    : null;

  const initialValues: StacksTransactionFormValues = {
    fee: '',
    feeCurrency: 'STX',
    feeType: FeeTypes[FeeTypes.Middle],
    nonce: nextNonce?.nonce,
  };

  return (
    <>
      <PopupHeader showSwitchAccount balance="stx" />
      <Flex
        alignItems="center"
        background="ink.background-primary"
        flexDirection="column"
        p="space.05"
        width="100%"
      >
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validateOnChange={false}
          validateOnMount={false}
          validateOnBlur={false}
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

              <NonceSetter />
              <FeeForm fees={stxFees} sbtcSponsorshipEligibility={sbtcSponsorshipEligibility} />
              <Link
                alignSelf="flex-end"
                my="space.04"
                onClick={() => navigate(RouteUrls.EditNonce)}
              >
                Edit nonce
              </Link>
              <MinimalErrorMessage />
              <StacksTxSubmitAction canSubmit={canSubmit} />

              <HighFeeSheet learnMoreUrl={HIGH_FEE_WARNING_LEARN_MORE_URL_STX} />
              <Outlet />
            </>
          )}
        </Formik>
      </Flex>
    </>
  );
}

export const TransactionRequest = memo(TransactionRequestBase);
