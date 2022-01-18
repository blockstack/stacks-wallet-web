import { AccountBalanceStxKeys } from '@shared/models/account-types';
import { Account } from '@stacks/wallet-sdk';

export type AccountWithAddress = Account & { address: string };

export const accountBalanceStxKeys: AccountBalanceStxKeys[] = [
  'balance',
  'total_sent',
  'total_received',
  'total_fees_sent',
  'total_miner_rewards_received',
  'locked',
];
