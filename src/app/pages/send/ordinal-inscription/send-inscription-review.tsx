import { useLocation, useNavigate } from 'react-router-dom';

import { Box, Stack } from 'leather-styles/jsx';
import get from 'lodash.get';

import { RouteUrls } from '@shared/route-urls';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { FormAddressDisplayer } from '@app/components/address-displayer/form-address-displayer';
import { LeatherButton } from '@app/components/button/button';
import { BaseDrawer } from '@app/components/drawer/base-drawer';
import { InfoCard, InfoCardRow, InfoCardSeparator } from '@app/components/info-card/info-card';
import { InscriptionPreview } from '@app/components/inscription-preview-card/components/inscription-preview';
import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/address/utxos-by-address.hooks';
import { useAppDispatch } from '@app/store';
import { inscriptionSent } from '@app/store/ordinals/ordinals.slice';

import { InscriptionPreviewCard } from '../../../components/inscription-preview-card/inscription-preview-card';
import { useBitcoinBroadcastTransaction } from '../../../query/bitcoin/transaction/use-bitcoin-broadcast-transaction';
import { useSendInscriptionState } from './components/send-inscription-container';

function useSendInscriptionReviewState() {
  const location = useLocation();
  return {
    arrivesIn: get(location.state, 'time') as string,
    signedTx: get(location.state, 'tx') as string,
    recipient: get(location.state, 'recipient', '') as string,
    feeRowValue: get(location.state, 'feeRowValue') as string,
  };
}

export function SendInscriptionReview() {
  const analytics = useAnalytics();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { arrivesIn, signedTx, recipient, feeRowValue } = useSendInscriptionReviewState();

  const { inscription } = useSendInscriptionState();
  const { refetch } = useCurrentNativeSegwitUtxos();
  const { broadcastTx, isBroadcasting } = useBitcoinBroadcastTransaction();

  async function sendInscription() {
    await broadcastTx({
      tx: signedTx,
      async onSuccess(txId: string) {
        void analytics.track('broadcast_ordinal_transaction');
        await refetch();
        // Might be a BRC-20 transfer, so we want to remove it from the pending
        dispatch(inscriptionSent({ inscriptionId: inscription.id }));
        navigate(`/${RouteUrls.SendOrdinalInscription}/${RouteUrls.SendOrdinalInscriptionSent}`, {
          state: {
            inscription,
            recipient,
            arrivesIn,
            txId,
            feeRowValue,
          },
        });
      },
      onError() {
        navigate(`/${RouteUrls.SendOrdinalInscription}/${RouteUrls.SendOrdinalInscriptionError}`);
      },
    });
  }

  return (
    <BaseDrawer title="Review" isShowing enableGoBack onClose={() => navigate(RouteUrls.Home)}>
      <Box px="extra-loose" mt="extra-loose">
        <InscriptionPreviewCard
          image={<InscriptionPreview inscription={inscription} />}
          subtitle="Ordinal inscription"
          title={inscription.title}
        />
      </Box>

      <InfoCard pt="extra-loose" pb="extra-loose" px="extra-loose">
        <Stack width="100%" mb="36px">
          <InfoCardRow title="To" value={<FormAddressDisplayer address={recipient} />} />
          <InfoCardSeparator />
          {arrivesIn && <InfoCardRow title="Estimated confirmation time" value={arrivesIn} />}
          <InfoCardRow title="Fee" value={feeRowValue} />
        </Stack>

        <LeatherButton aria-busy={isBroadcasting} width="100%" onClick={sendInscription}>
          Confirm and send transaction
        </LeatherButton>
      </InfoCard>
    </BaseDrawer>
  );
}
