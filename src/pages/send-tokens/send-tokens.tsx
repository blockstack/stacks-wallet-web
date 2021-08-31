import React, { memo, Suspense, useCallback, useEffect, useState } from 'react';
import { Box, Text, Button, Stack } from '@stacks/ui';
import { Formik, useFormikContext } from 'formik';

import { PopupContainer } from '@components/popup/container';
import { useDoChangeScreen } from '@common/hooks/use-do-change-screen';

import { ScreenPaths } from '@common/types';
import { ErrorLabel } from '@components/error-label';
import { AssetSearch } from '@pages/send-tokens/components/asset-search/asset-search';

import { Header } from '@components/header';
import { useSelectedAsset } from '@common/hooks/use-selected-asset';

import { useSendFormValidation } from '@pages/send-tokens/hooks/use-send-form-validation';
import { AmountField } from '@pages/send-tokens/components/amount-field';
import { RecipientField } from '@pages/send-tokens/components/recipient-field';
import { MemoField } from '@pages/send-tokens/components/memo-field';
import { useTransferableAssets } from '@store/assets/asset.hooks';
import { useRefreshAllAccountData } from '@common/hooks/account/use-refresh-all-account-data';
import { ConfirmSendDrawer } from '@pages/transaction-signing/components/confirm-send-drawer';
import { SendFormSelectors } from '@tests/page-objects/send-form.selectors';
import { SendFormMemoWarning } from './components/memo-warning';
import {
  useLocalTransactionInputsState,
  useTxForSettingsState,
} from '@store/transactions/transaction.hooks';
import { useLoading } from '@common/hooks/use-loading';
import { useDrawers } from '@common/hooks/use-drawers';

type Amount = number | '';

export interface FormValues {
  amount: Amount;
  recipient: string;
  memo: string;
}

const initialValues: FormValues = {
  amount: '',
  recipient: '',
  memo: '',
};

interface SendFormProps {
  assetError: string | undefined;
  setAssetError: (error: string | undefined) => void;
}

const SendForm = (props: SendFormProps) => {
  const { assetError } = props;
  const { isLoading } = useLoading('send-tokens');

  const doChangeScreen = useDoChangeScreen();
  const { selectedAsset } = useSelectedAsset();
  const refreshAllAccountData = useRefreshAllAccountData();
  const assets = useTransferableAssets();

  const { handleSubmit, values, setValues, errors, setFieldError } = useFormikContext<FormValues>();

  const onSubmit = useCallback(async () => {
    if (values.amount && values.recipient && selectedAsset) {
      handleSubmit();
      await refreshAllAccountData(250);
    }
  }, [refreshAllAccountData, handleSubmit, values, selectedAsset]);

  const onItemSelect = useCallback(() => {
    if (assets.length === 1) return;
    setValues({ ...values, amount: '' });
    setFieldError('amount', undefined);
  }, [assets, setValues, values, setFieldError]);

  const hasValues = values.amount && values.recipient !== '';

  const symbol = selectedAsset?.type === 'stx' ? 'STX' : selectedAsset?.meta?.symbol;

  return (
    <PopupContainer
      header={<Header title="Send" onClose={() => doChangeScreen(ScreenPaths.POPUP_HOME)} />}
    >
      <Stack spacing="loose" flexDirection="column" flexGrow={1} shouldWrapChildren>
        <AssetSearch onItemClick={onItemSelect} />
        <Suspense fallback={<></>}>
          <AmountField value={values.amount || 0} error={errors.amount} />
        </Suspense>
        <RecipientField error={errors.recipient} value={values.recipient} />
        {selectedAsset?.hasMemo && <MemoField value={values.memo} error={errors.memo} />}
        {selectedAsset?.hasMemo && symbol && <SendFormMemoWarning symbol={symbol} />}
        <Box mt="auto">
          {assetError && (
            <ErrorLabel mb="base">
              <Text textStyle="caption">{assetError}</Text>
            </ErrorLabel>
          )}
          <Button
            type="submit"
            borderRadius="12px"
            width="100%"
            onClick={onSubmit}
            isDisabled={!hasValues}
            data-testid={SendFormSelectors.BtnPreviewSendTx}
            isLoading={isLoading}
          >
            Preview
          </Button>
        </Box>
      </Stack>
    </PopupContainer>
  );
};

const ShowDelay = ({
  setShowing,
  beginShow,
  isShowing,
}: {
  setShowing: (value: boolean) => void;
  beginShow: boolean;
  isShowing: boolean;
}) => {
  const [tx] = useTxForSettingsState();
  const [txData] = useLocalTransactionInputsState();
  useEffect(() => {
    if (beginShow && tx && !isShowing && txData) {
      setShowing(true);
    }
  }, [beginShow, tx, setShowing, txData, isShowing]);

  return null;
};

export const SendTokensForm: React.FC = memo(() => {
  const { setIsIdle, setIsLoading } = useLoading('send-tokens');

  const [isShowing, setShowing] = useState(false);
  const [assetError, setAssetError] = useState<string | undefined>();
  const { selectedAsset } = useSelectedAsset();
  const sendFormSchema = useSendFormValidation({ setAssetError });
  const [, setTxData] = useLocalTransactionInputsState();
  const [beginShow, setBeginShow] = useState(false);
  const { showTxSettings } = useDrawers();
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={values => {
        if (values.amount && values.recipient && values.recipient !== '' && selectedAsset)
          if (!assetError) {
            setTxData({
              memo: values.memo,
              recipient: values.recipient,
              amount: values.amount,
            });
            setIsLoading();
            setBeginShow(true);
          }
      }}
      validateOnChange={false}
      validateOnBlur={false}
      validateOnMount={false}
      validationSchema={sendFormSchema}
    >
      {form => (
        <>
          {beginShow && (
            <React.Suspense fallback={<></>}>
              <ShowDelay setShowing={setShowing} beginShow={beginShow} isShowing={isShowing} />
            </React.Suspense>
          )}
          <React.Suspense fallback={<></>}>
            <ConfirmSendDrawer
              onClose={() => {
                setShowing(false);
                form.setSubmitting(false);
                setTxData(null);
                setIsIdle();
              }}
              isShowing={isShowing && !showTxSettings}
            />
          </React.Suspense>
          <React.Suspense fallback={<></>}>
            <SendForm setAssetError={setAssetError} assetError={assetError} />
          </React.Suspense>
        </>
      )}
    </Formik>
  );
});
