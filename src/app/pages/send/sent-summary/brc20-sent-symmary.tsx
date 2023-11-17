import { useLocation, useNavigate } from 'react-router-dom';

import { HStack, Stack } from 'leather-styles/jsx';
import get from 'lodash.get';

import { createMoney } from '@shared/models/money.model';

import { HandleOpenTxLinkArgs } from '@app/common/hooks/use-explorer-link';
import { useRouteHeader } from '@app/common/hooks/use-route-header';
import { formatMoney } from '@app/common/money/format-money';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import {
  InfoCard,
  InfoCardAssetValue,
  InfoCardBtn,
  InfoCardFooter,
  InfoCardRow,
  InfoCardSeparator,
} from '@app/components/info-card/info-card';
import { InfoLabel } from '@app/components/info-label';
import { ModalHeader } from '@app/components/modal-header';
import { LeatherButton } from '@app/ui/components/button';
import { ExternalLinkIcon } from '@app/ui/components/icons/external-link-icon';

import { TxDone } from '../send-crypto-asset-form/components/tx-done';

function useBrc20SentSummaryState() {
  const location = useLocation();
  return {
    serviceFee: get(location.state, 'serviceFee') as string,
    totalFee: get(location.state, 'totalFee') as string,
    recipient: get(location.state, 'recipient') as string,
    tick: get(location.state, 'tick') as string,
    amount: get(location.state, 'amount') as string,
    txId: get(location.state, 'txId') as string,
    txLink: get(location.state, 'txLink') as HandleOpenTxLinkArgs,
    feeRowValue: get(location.state, 'feeRowValue') as string,
  };
}

export function Brc20SentSummary() {
  const { tick, amount, serviceFee, totalFee, feeRowValue } = useBrc20SentSummaryState();
  const amountFormatted = formatMoney(createMoney(Number(amount), tick, 0));
  const navigate = useNavigate();

  function onClickLink() {
    navigate('/');
  }

  useRouteHeader(<ModalHeader hideActions defaultClose title="Creating transfer inscription" />);

  return (
    <InfoCard>
      <TxDone />

      <InfoCardAssetValue px="space.05" symbol={tick} value={Number(amount)} />

      <Stack px="space.06" pb="space.06" width="100%">
        <InfoLabel mb="space.05" title="One more step is required to send tokens">
          {`You'll need to send the transfer inscription to your recipient of choice from the home screen once its status changes to "Ready to send"`}
          <br />
          <br />
          <LeatherButton
            fontSize={1}
            fontWeight={500}
            lineHeight="1.6"
            onClick={() => {
              openInNewTab('https://leather.gitbook.io/guides/bitcoin/sending-brc-20-tokens');
            }}
            variant="link"
          >
            {'Learn more'}
          </LeatherButton>
        </InfoLabel>
        <InfoCardSeparator />

        <InfoCardRow title="Sending" value={amountFormatted} />
        <InfoCardRow title="Inscription service fee" value={serviceFee} />
        <InfoCardRow title="Payment transaction fee" value={feeRowValue} />

        <InfoCardSeparator />
        <InfoCardRow title="Total fee" value={totalFee} />
      </Stack>
      <InfoCardFooter>
        <HStack gap="sapce.04" width="100%">
          <InfoCardBtn
            icon={<ExternalLinkIcon size="14px" />}
            label="Pending BRC-20 transfers"
            onClick={onClickLink}
          />
        </HStack>
      </InfoCardFooter>
    </InfoCard>
  );
}
