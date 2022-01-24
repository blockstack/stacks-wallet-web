import { Button, Stack } from '@stacks/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { Caption, Title } from '@app/components/typography';
import { SpaceBetween } from '@app/components/space-between';

const providersInfo = {
  transak: {
    title: 'Transak',
    body: 'Non-US residents can purchase STX with credit card, debit card, or bank transfer via Transak.',
    cta: 'Buy on Transak',
  },
  okcoin: {
    title: 'Okcoin',
    body: 'US users can purchase STX quickly with USD',
    cta: 'Buy on Okcoin',
  },
};

export interface ProvidersUrl {
  transak: string;
  okcoin: string;
}

interface OnrampProviderLayoutProps {
  provider: string;
  providerUrl: string;
}

export const OnrampProviderLayout = ({ provider, providerUrl }: OnrampProviderLayoutProps) => {
  const { title, cta, body } = providersInfo[provider as keyof ProvidersUrl];
  return (
    <Stack
      overflow="hidden"
      alignItems="flex-start"
      spacing="base-tight"
      padding="24px"
      mt={5}
      className="buy-box"
    >
      <SpaceBetween flexGrow={1}>
        <Stack spacing="base-tight">
          <Title marginBottom="10">{title}</Title>
          <Caption>{body}</Caption>
        </Stack>
      </SpaceBetween>
      <Button width="100%" mt={5} onClick={() => openInNewTab(providerUrl)} borderRadius="10px">
        {cta}
      </Button>
    </Stack>
  );
};
