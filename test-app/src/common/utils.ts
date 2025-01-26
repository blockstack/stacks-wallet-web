import { StacksMainnet, StacksTestnet } from '@stacks/network-v6';
import { RPCClient } from '@stacks/rpc-client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const testnetUrl = 'https://api.testnet.hiro.so/';
const localhostUrl = 'http://localhost:3999';

export const getRPCClient = () => {
  return new RPCClient(testnetUrl);
};

export const toRelativeTime = (ts: number): string => dayjs().to(ts);

export const stacksTestnetNetwork = new StacksTestnet({ url: testnetUrl });

export const stacksMainnetNetwork = new StacksMainnet();

export const stacksLocalhostNetwork = new StacksTestnet({ url: localhostUrl });
