import {
  ADDRESS_TXS_DATA,
  FEE_ESTIMATIONS_DATA,
  HEY_CONTRACT_INFO,
  HEY_CONTRACT_INTERFACE,
  HEY_CONTRACT_SOURCE_DATA,
  TOKEN_CONTRACT_DATA,
  TOKEN_CONTRACT_INFO_DATA,
  TOKEN_CONTRACT_SOURCE_DATA,
  TOKEN_FT_DATA,
  TOKEN_GET_DECIMALS_DATA,
  TOKEN_GET_NAME_DATA,
  TOKEN_GET_SYMBOL_DATA,
  TX_MEMPOOL_DATA,
  V1_ADDRESS_DATA,
  V2_ACCOUNTS_DATA,
} from './heystack/data';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { delay } from '@common/utils';

enum GetRequests {
  v1Address = 'https://stacks-node-api.regtest.stacks.co/extended/v1/address/ST2PHCPANVT8DVPSY5W2ZZ81M285Q5Z8Y6DQMZE7Z/balances',
  v2Accounts = 'https://stacks-node-api.regtest.stacks.co/v2/accounts/ST2PHCPANVT8DVPSY5W2ZZ81M285Q5Z8Y6DQMZE7Z',
  addressTxs = 'https://stacks-node-api.regtest.stacks.co/extended/v1/address/ST2PHCPANVT8DVPSY5W2ZZ81M285Q5Z8Y6DQMZE7Z/transactions',
  txMempool = 'https://stacks-node-api.regtest.stacks.co/extended/v1/tx/mempool',
  tokenContractInterface = 'https://stacks-node-api.regtest.stacks.co/v2/contracts/interface/ST21FTC82CCKE0YH9SK5SJ1D4XEMRA069FKV0VJ8N/hey-token',
  tokenContractSource = 'https://stacks-node-api.regtest.stacks.co/v2/contracts/source/ST21FTC82CCKE0YH9SK5SJ1D4XEMRA069FKV0VJ8N/hey-token',
  tokenContractInfo = 'https://stacks-node-api.regtest.stacks.co/extended/v1/contract/ST21FTC82CCKE0YH9SK5SJ1D4XEMRA069FKV0VJ8N.hey-token',
  heyContractInterface = 'https://stacks-node-api.regtest.stacks.co/v2/contracts/interface/ST21FTC82CCKE0YH9SK5SJ1D4XEMRA069FKV0VJ8N/hey-final',
  heyContractSource = 'https://stacks-node-api.regtest.stacks.co/v2/contracts/source/ST21FTC82CCKE0YH9SK5SJ1D4XEMRA069FKV0VJ8N/hey-final',
  heyContractInfo = 'https://stacks-node-api.regtest.stacks.co/extended/v1/contract/ST21FTC82CCKE0YH9SK5SJ1D4XEMRA069FKV0VJ8N.hey-final',
  heyFtData = 'https://stacks-node-api.regtest.stacks.co/extended/v1/tokens/ST21FTC82CCKE0YH9SK5SJ1D4XEMRA069FKV0VJ8N.hey-token/ft/metadata',
  fees = 'https://stacks-node-api.regtest.stacks.co/v2/fees/transfer',
  nonces = 'https://stacks-node-api.regtest.stacks.co/extended/v1/address/ST2PHCPANVT8DVPSY5W2ZZ81M285Q5Z8Y6DQMZE7Z/nonces',
}

export enum PostRequests {
  heyTokenGetName = 'https://stacks-node-api.regtest.stacks.co/v2/contracts/call-read/ST21FTC82CCKE0YH9SK5SJ1D4XEMRA069FKV0VJ8N/hey-token/get-name',
  heyTokenGetSymbol = 'https://stacks-node-api.regtest.stacks.co/v2/contracts/call-read/ST21FTC82CCKE0YH9SK5SJ1D4XEMRA069FKV0VJ8N/hey-token/get-symbol',
  heyTokenGetDecimals = 'https://stacks-node-api.regtest.stacks.co/v2/contracts/call-read/ST21FTC82CCKE0YH9SK5SJ1D4XEMRA069FKV0VJ8N/hey-token/get-decimals',
  broadcastTransaction = 'https://stacks-node-api.regtest.stacks.co/v2/transactions',
  feeEstimations = 'https://stacks-node-api.testnet.stacks.co/v2/fees/transaction',
}

const getRequests: Record<string, string> = {
  [GetRequests.v1Address]: V1_ADDRESS_DATA,
  [GetRequests.v2Accounts]: V2_ACCOUNTS_DATA,
  [GetRequests.addressTxs]: ADDRESS_TXS_DATA,
  [GetRequests.txMempool]: TX_MEMPOOL_DATA,
  [GetRequests.tokenContractInterface]: TOKEN_CONTRACT_DATA,
  [GetRequests.tokenContractSource]: TOKEN_CONTRACT_SOURCE_DATA,
  [GetRequests.tokenContractInfo]: TOKEN_CONTRACT_INFO_DATA,
  [GetRequests.heyContractInfo]: HEY_CONTRACT_INFO,
  [GetRequests.heyContractSource]: HEY_CONTRACT_SOURCE_DATA,
  [GetRequests.heyContractInterface]: HEY_CONTRACT_INTERFACE,
  [GetRequests.heyFtData]: TOKEN_FT_DATA,
  [GetRequests.fees]: '1',
};

const postRequests: Record<string, string> = {
  [PostRequests.heyTokenGetName]: TOKEN_GET_NAME_DATA,
  [PostRequests.heyTokenGetSymbol]: TOKEN_GET_SYMBOL_DATA,
  [PostRequests.heyTokenGetDecimals]: TOKEN_GET_DECIMALS_DATA,
  [PostRequests.broadcastTransaction]: 'null',
  [PostRequests.feeEstimations]: FEE_ESTIMATIONS_DATA,
};

export function setupHeystackEnv(
  handleRequest?: Record<string, (req: any, res: any, ctx: any) => void>
) {
  let mockLocalStorage: Record<string, string> = {};

  const getPaths = Object.keys(getRequests).map(path => {
    return rest.get(path, async (req, res, ctx) => {
      await delay(100);
      if (handleRequest && handleRequest[path]) return handleRequest[path](req, res, ctx);
      return res(ctx.json(JSON.parse(getRequests[path] as any)));
    });
  });
  const postPaths = Object.keys(postRequests).map(path => {
    return rest.post(path, async (req, res, ctx) => {
      await delay(100);
      if (handleRequest && handleRequest[path]) return handleRequest[path](req, res, ctx);
      return res(ctx.json(JSON.parse(postRequests[path] as any)));
    });
  });

  const server = setupServer(...getPaths, ...postPaths);

  beforeAll(() => {
    server.listen();
    global.Storage.prototype.setItem = jest.fn((key, value) => {
      mockLocalStorage[key] = value;
    });
    global.Storage.prototype.getItem = jest.fn(key => mockLocalStorage[key]);
  });

  beforeEach(() => {
    mockLocalStorage = {};
  });

  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    server.close();
    (global.Storage.prototype.setItem as jest.Mock).mockReset();
    (global.Storage.prototype.getItem as jest.Mock).mockReset();
  });
}
