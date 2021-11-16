import React, { memo } from 'react';
import { Stack } from '@stacks/ui';

import { useCurrentNetwork } from '@common/hooks/use-current-network';
import { getUrlHostname, getUrlPort } from '@common/utils';
import { Caption, Title } from '@components/typography';
import { usePageTitle } from '@pages/sign-transaction/hooks/use-page-title';
import { useTransactionRequestState } from '@store/transactions/requests.hooks';
import { useOrigin } from '@store/transactions/requests.hooks';

function addPortSuffix(url: string) {
  const port = getUrlPort(url);
  return port ? `:${port}` : '';
}

function PageTopBase(): JSX.Element | null {
  const transactionRequest = useTransactionRequestState();
  const origin = useOrigin();
  const pageTitle = usePageTitle();
  const network = useCurrentNetwork();
  if (!transactionRequest) return null;

  const appName = transactionRequest?.appDetails?.name;
  const originAddition = origin ? ` (${getUrlHostname(origin)})` : '';
  const testnetAddition = network.isTestnet
    ? ` using ${getUrlHostname(network.url)}${addPortSuffix(network.url)}`
    : '';
  const caption = appName ? `Requested by "${appName}"${originAddition}${testnetAddition}` : null;

  return (
    <Stack pt="extra-loose" spacing="base">
      <Title fontWeight="bold" as="h1">
        {pageTitle}
      </Title>
      {caption && <Caption wordBreak="break-word">{caption}</Caption>}
    </Stack>
  );
}

export const PageTop = memo(PageTopBase);
