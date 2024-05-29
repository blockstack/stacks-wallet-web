import { useLocation, useNavigate } from 'react-router-dom';

import GenericError from '@assets/images/generic-error.png';
import { Button, Dialog, DialogHeader, Footer } from '@leather-wallet/ui';
import { Flex, styled } from 'leather-styles/jsx';
import get from 'lodash.get';

export function BroadcastErrorDialog() {
  const navigate = useNavigate();
  const location = useLocation();
  const message = get(location.state, 'message', '');

  return (
    <Dialog
      isShowing
      header={<DialogHeader />}
      onClose={() => navigate('..')}
      footer={
        <Footer>
          <Button fullWidth onClick={() => navigate('..')} mt="space.05">
            Close
          </Button>
        </Footer>
      }
    >
      <Flex
        flexDirection="column"
        justifyContent="center"
        mx="space.06"
        mb="space.02"
        position="relative"
        textAlign="center"
        minHeight="30vh"
      >
        <styled.img src={GenericError} width="106px" height="72px" m="0 auto" />
        <styled.h1 mt="space.05" textStyle="heading.05">
          Unable to broadcast transaction
        </styled.h1>
        <styled.span mt="space.03" px="space.04" textStyle="body.01">
          Your transaction failed to broadcast{' '}
          {message && <>because of the error: {message.toLowerCase()}</>}
        </styled.span>
      </Flex>
    </Dialog>
  );
}
