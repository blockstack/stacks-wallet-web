import { Outlet } from 'react-router-dom';

import { Box } from '@stacks/ui';
import { Form, Formik } from 'formik';

import { HIGH_FEE_WARNING_LEARN_MORE_URL_BTC } from '@shared/constants';

import { BtcIcon } from '@app/components/icons/btc-icon';
import { HighFeeDrawer } from '@app/features/high-fee-drawer/high-fee-drawer';
import { useNativeSegwitBalance } from '@app/query/bitcoin/balance/bitcoin-balances.query';
import { useCryptoCurrencyMarketData } from '@app/query/common/market-data/market-data.hooks';
import { useCurrentBtcNativeSegwitAccountAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { AmountField } from '../../components/amount-field';
import { AvailableBalance } from '../../components/available-balance';
import { FormErrors } from '../../components/form-errors';
import { FormFieldsLayout } from '../../components/form-fields.layout';
import { PreviewButton } from '../../components/preview-button';
import { SelectedAssetField } from '../../components/selected-asset-field';
import { SendCryptoAssetFormLayout } from '../../components/send-crypto-asset-form.layout';
import { SendFiatValue } from '../../components/send-fiat-value';
import { SendMaxButton } from '../../components/send-max-button';
import { useCalculateMaxBitcoinSpend } from '../../family/bitcoin/hooks/use-calculate-max-spend';
import { useSendFormRouteState } from '../../hooks/use-send-form-route-state';
import { createDefaultInitialFormValues, defaultSendFormFormikProps } from '../../send-form.utils';
import { BtcRecipientField } from './components/btc-recipient-field';
import { TestnetBtcMessage } from './components/testnet-btc-message';
import { useBtcSendForm } from './use-btc-send-form';

export function BtcSendForm() {
  const routeState = useSendFormRouteState();
  const btcMarketData = useCryptoCurrencyMarketData('BTC');

  const currentAccountBtcAddress = useCurrentBtcNativeSegwitAccountAddressIndexZero();
  const btcBalance = useNativeSegwitBalance(currentAccountBtcAddress);

  const calcMaxSpend = useCalculateMaxBitcoinSpend();

  const { validationSchema, currentNetwork, formRef, previewTransaction, onFormStateChange } =
    useBtcSendForm();

  return (
    <SendCryptoAssetFormLayout>
      <Formik
        initialValues={createDefaultInitialFormValues({
          ...routeState,
          recipientAddressOrBnsName: '',
        })}
        onSubmit={previewTransaction}
        validationSchema={validationSchema}
        innerRef={formRef}
        {...defaultSendFormFormikProps}
      >
        {props => {
          onFormStateChange(props.values);
          return (
            <Form>
              <AmountField
                balance={btcBalance.balance}
                switchableAmount={<SendFiatValue marketData={btcMarketData} assetSymbol={'BTC'} />}
                bottomInputOverlay={
                  <SendMaxButton
                    balance={btcBalance.balance}
                    sendMaxBalance={
                      calcMaxSpend(props.values.recipient)?.spendableBitcoin.toString() ?? '0'
                    }
                  />
                }
                autoComplete="off"
              />
              <FormFieldsLayout>
                <SelectedAssetField icon={<BtcIcon />} name={btcBalance.asset.name} symbol="BTC" />
                <BtcRecipientField />
              </FormFieldsLayout>
              {currentNetwork.chain.bitcoin.network === 'testnet' && <TestnetBtcMessage />}
              <FormErrors />
              <PreviewButton />
              <Box my="base">
                <AvailableBalance availableBalance={btcBalance.balance} />
              </Box>
              <HighFeeDrawer learnMoreUrl={HIGH_FEE_WARNING_LEARN_MORE_URL_BTC} />
              <Outlet />
            </Form>
          );
        }}
      </Formik>
    </SendCryptoAssetFormLayout>
  );
}
