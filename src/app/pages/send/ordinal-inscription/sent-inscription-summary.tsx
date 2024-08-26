import { useLocation, useNavigate } from 'react-router-dom';

import { Box, Flex, HStack, Stack } from 'leather-styles/jsx';
import get from 'lodash.get';

import type { Blockchains, Inscription } from '@leather.io/models';
import { CheckmarkIcon, CopyIcon, Dialog, DialogHeader, ExternalLinkIcon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useBitcoinExplorerLink } from '@app/common/hooks/use-bitcoin-explorer-link';
import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { FormAddressDisplayer } from '@app/components/address-displayer/form-address-displayer';
import { InfoCardBtn, InfoCardRow, InfoCardSeparator } from '@app/components/info-card/info-card';
import { InscriptionPreview } from '@app/components/inscription-preview-card/components/inscription-preview';
import { Card } from '@app/components/layout';
import { useToast } from '@app/features/toasts/use-toast';

import { InscriptionPreviewCard } from '../../../components/inscription-preview-card/inscription-preview-card';

function useSendInscriptionSummaryState() {
  const location = useLocation();
  return {
    txid: get(location.state, 'txid') as string,
    recipient: get(location.state, 'recipient', '') as string,
    arrivesIn: get(location.state, 'arrivesIn') as string,
    inscription: get(location.state, 'inscription') as Inscription,
    feeRowValue: get(location.state, 'feeRowValue') as string,
  };
}

export function SendInscriptionSummary() {
  const { txid, recipient, arrivesIn, inscription, feeRowValue } = useSendInscriptionSummaryState();
  const toast = useToast();
  const navigate = useNavigate();
  const txLink = {
    blockchain: 'bitcoin' as Blockchains,
    txid,
  };

  const id = txid || '';
  const { handleOpenBitcoinTxLink: handleOpenTxLink } = useBitcoinExplorerLink();

  function onClickLink() {
    void analytics.track('view_transaction_confirmation', { symbol: 'BTC' });
    handleOpenTxLink(txLink);
  }

  async function onClickCopy() {
    await copyToClipboard(id);
    toast.success('ID copied!');
  }

  return (
    <Dialog
      header={<DialogHeader title="Sent" />}
      isShowing
      onClose={() => navigate(RouteUrls.Home)}
    >
      <Card
        footer={
          <HStack gap="space.04" width="100%">
            <InfoCardBtn onClick={onClickLink} icon={<ExternalLinkIcon />} label="View details" />
            <InfoCardBtn onClick={onClickCopy} icon={<CopyIcon />} label="Copy ID" />
          </HStack>
        }
      >
        <Box mt="space.06" px="space.06">
          <InscriptionPreviewCard
            icon={<CheckmarkIcon mt="space.01" width="lg" />}
            image={<InscriptionPreview inscription={inscription} />}
            subtitle="Ordinal inscription"
            title={inscription.title}
          />
        </Box>
        <Flex
          alignItems="center"
          flexDirection="column"
          justifyItems="center"
          width="100%"
          pt="space.06"
          pb="space.06"
          px="space.06"
        >
          <Stack mb="space.06" width="100%">
            <InfoCardRow title="To" value={<FormAddressDisplayer address={recipient} />} />
            <InfoCardSeparator />
            {arrivesIn && <InfoCardRow title="Estimated confirmation time" value={arrivesIn} />}
            <InfoCardRow title="Fee" value={feeRowValue} />
          </Stack>
        </Flex>
      </Card>
    </Dialog>
  );
}
