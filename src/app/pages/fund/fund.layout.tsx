import { Box, color, Stack, useMediaQuery } from '@stacks/ui';

import { Text } from '@app/components/typography';
import { PageTitle } from '@app/components/page-title';
import { CenteredPageContainer } from '@app/components/centered-page-container';
import {
  CENTERED_FULL_PAGE_MAX_WIDTH,
  DESKTOP_VIEWPORT_MIN_WIDTH,
} from '@app/components/global-styles/full-page-styles';
import AddFunds from '@assets/images/fund/add-funds.png';
import { FiatProvidersList } from './components/fiat-providers-list';

interface FundLayoutProps {
  address: string;
}
export const FundLayout = (props: FundLayoutProps) => {
  const { address } = props;

  const [desktopViewport] = useMediaQuery(`(min-width: ${DESKTOP_VIEWPORT_MIN_WIDTH})`);

  return (
    <CenteredPageContainer>
      <Stack
        alignItems={['left', 'center']}
        pb={['loose', 'unset']}
        px={['loose', 'loose', 'unset']}
        spacing={['base', 'loose']}
        mt={['base', 'unset']}
      >
        <Box display={['none', 'block']} width={['100px', '84px']}>
          <img src={AddFunds} />
        </Box>
        <PageTitle
          fontSize={['24px', '32px', '48px']}
          lineHeight={['150%', '125%']}
          maxWidth={['unset', 'unset', CENTERED_FULL_PAGE_MAX_WIDTH]}
          px={['unset', 'loose']}
          textAlign={['left', 'center']}
        >
          {desktopViewport ? 'Let’s get STX into your wallet' : 'Get STX'}
        </PageTitle>
        <Text
          color={desktopViewport ? 'unset' : color('text-caption')}
          maxWidth="544px"
          textAlign={['left', 'center']}
        >
          Choose an exchange to fund your account with Stacks (STX) or deposit from elsewhere.
          Exchanges with “Fast checkout” make it easier to purchase STX for direct deposit into your
          wallet with a credit card.
        </Text>
      </Stack>
      <FiatProvidersList address={address} />
    </CenteredPageContainer>
  );
};
