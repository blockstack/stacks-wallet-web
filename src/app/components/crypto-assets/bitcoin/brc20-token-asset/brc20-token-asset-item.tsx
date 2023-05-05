import { BoxProps } from '@stacks/ui';
import { forwardRefWithAs } from '@stacks/ui-core';

import { createMoney } from '@shared/models/money.model';

import { Brc20Token } from '@app/query/bitcoin/ordinals/brc20-tokens.query';

import { Brc20TokenAssetItemLayout } from './brc20-token-asset-item.layout';

interface Brc20TokenAssetItemProps extends BoxProps {
  token: Brc20Token;
}
export const Brc20TokenAssetItem = forwardRefWithAs((props: Brc20TokenAssetItemProps, ref) => {
  const { token, ...rest } = props;

  return (
    <Brc20TokenAssetItemLayout
      balance={createMoney(Number(token.availableBalance), token.ticker, 0)}
      caption="BRC-20"
      ref={ref}
      title={token.ticker}
      {...rest}
    />
  );
});
