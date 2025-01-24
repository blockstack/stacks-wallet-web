// TEMPORARY FILE: COPIED FOR TEST-APP LEGACY STACKS NETWORK SUPPORT
// TODO: Remove with test-app Connect upgrade to SIP-30
export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;
export interface RequestContext {
  fetch: FetchFn;
  url: string;
  init: RequestInit;
}
export interface ResponseContext {
  fetch: FetchFn;
  url: string;
  init: RequestInit;
  response: Response;
}
export interface FetchParams {
  url: string;
  init: RequestInit;
}
export interface FetchMiddleware {
  pre?: (context: RequestContext) => PromiseLike<FetchParams | void> | FetchParams | void;
  post?: (context: ResponseContext) => Promise<Response | void> | Response | void;
}
// Define a default request options and allow modification using getters, setters
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
const defaultFetchOpts: RequestInit = {
  // By default referrer value will be client:origin: above reference link
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  referrerPolicy: 'origin', // Use origin value for referrer policy
  headers: {
    'x-hiro-product': 'stacksjs',
  },
};
export async function fetchWrapper(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const fetchOpts = {};
  // Use the provided options in request options along with default or user provided values
  Object.assign(fetchOpts, defaultFetchOpts, init);

  const fetchResult = await fetch(input, fetchOpts);
  return fetchResult;
}
function argsForCreateFetchFn(args: any[]): { fetchLib: FetchFn; middlewares: FetchMiddleware[] } {
  let fetchLib: FetchFn = fetchWrapper;
  let middlewares: FetchMiddleware[] = [];
  if (args.length > 0 && typeof args[0] === 'function') {
    fetchLib = args.shift();
  }
  if (args.length > 0) {
    middlewares = args; // remaining args
  }
  return { fetchLib, middlewares };
}
export function createFetchFn(fetchLib: FetchFn, ...middleware: FetchMiddleware[]): FetchFn;
export function createFetchFn(...middleware: FetchMiddleware[]): FetchFn;
export function createFetchFn(...args: any[]): FetchFn {
  const { fetchLib, middlewares } = argsForCreateFetchFn(args);

  const fetchFn = async (url: string, init?: RequestInit | undefined): Promise<Response> => {
    let fetchParams = { url, init: init ?? {} };

    for (const middleware of middlewares) {
      if (typeof middleware.pre === 'function') {
        const result = await Promise.resolve(
          middleware.pre({
            fetch: fetchLib,
            ...fetchParams,
          })
        );
        fetchParams = result ?? fetchParams;
      }
    }

    let response = await fetchLib(fetchParams.url, fetchParams.init);

    for (const middleware of middlewares) {
      if (typeof middleware.post === 'function') {
        const result = await Promise.resolve(
          middleware.post({
            fetch: fetchLib,
            url: fetchParams.url,
            init: fetchParams.init,
            response: response?.clone() ?? response,
          })
        );
        response = result ?? response;
      }
    }
    return response;
  };
  return fetchFn;
}
export enum ChainID {
  Testnet = 2147483648,
  Mainnet = 1,
}
export enum TransactionVersion {
  Mainnet = 0,
  Testnet = 128,
}

export const HIRO_MAINNET_DEFAULT = 'https://api.mainnet.hiro.so';
export const HIRO_TESTNET_DEFAULT = 'https://api.testnet.hiro.so';
export const HIRO_MOCKNET_DEFAULT = 'http://localhost:3999';

/**
 * Used for constructing Network instances
 * @related {@link StacksNetwork}, {@link StacksMainnet}, {@link StacksTestnet}, {@link StacksDevnet}, {@link StacksMocknet}
 */
export interface NetworkConfig {
  /** The base API/node URL for the network fetch calls */
  url: string;
  /** An optional custom fetch function to override default behaviors */
  fetchFn?: FetchFn;
}

/** @ignore internal */
export const StacksNetworks = ['mainnet', 'testnet', 'devnet', 'mocknet'] as const;
/** The enum-style names of different common Stacks networks */
export type StacksNetworkName = (typeof StacksNetworks)[number];

/**
 * The base class for Stacks networks. Typically used via its subclasses.
 * @related {@link StacksMainnet}, {@link StacksTestnet}, {@link StacksDevnet}, {@link StacksMocknet}
 */
export class StacksNetwork {
  version: TransactionVersion = TransactionVersion.Mainnet;
  chainId: ChainID = ChainID.Mainnet;
  bnsLookupUrl = 'https://api.mainnet.hiro.so';
  broadcastEndpoint = '/v2/transactions';
  transferFeeEstimateEndpoint = '/v2/fees/transfer';
  transactionFeeEstimateEndpoint = '/v2/fees/transaction';
  accountEndpoint = '/v2/accounts';
  contractAbiEndpoint = '/v2/contracts/interface';
  readOnlyFunctionCallEndpoint = '/v2/contracts/call-read';

  readonly coreApiUrl: string;

  fetchFn: FetchFn;

  constructor(networkConfig: NetworkConfig) {
    this.coreApiUrl = networkConfig.url;
    this.fetchFn = networkConfig.fetchFn ?? createFetchFn();
  }

  /** A static network constructor from a network name */
  static fromName = (networkName: StacksNetworkName): StacksNetwork => {
    switch (networkName) {
      case 'mainnet':
        return new StacksMainnet();
      case 'testnet':
        return new StacksTestnet();
      case 'devnet':
        return new StacksDevnet();
      case 'mocknet':
        return new StacksMocknet();
      default:
        throw new Error(
          `Invalid network name provided. Must be one of the following: ${StacksNetworks.join(
            ', '
          )}`
        );
    }
  };

  /** @ignore internal */
  static fromNameOrNetwork = (network: StacksNetworkName | StacksNetwork) => {
    if (typeof network !== 'string' && 'version' in network) {
      return network;
    }

    return StacksNetwork.fromName(network);
  };

  /** Returns `true` if the network is configured to 'mainnet', based on the TransactionVersion */
  isMainnet = () => this.version === TransactionVersion.Mainnet;
  getBroadcastApiUrl = () => `${this.coreApiUrl}${this.broadcastEndpoint}`;
  getTransferFeeEstimateApiUrl = () => `${this.coreApiUrl}${this.transferFeeEstimateEndpoint}`;
  getTransactionFeeEstimateApiUrl = () =>
    `${this.coreApiUrl}${this.transactionFeeEstimateEndpoint}`;
  getAccountApiUrl = (address: string) =>
    `${this.coreApiUrl}${this.accountEndpoint}/${address}?proof=0`;
  getAccountExtendedBalancesApiUrl = (address: string) =>
    `${this.coreApiUrl}/extended/v1/address/${address}/balances`;
  getAbiApiUrl = (address: string, contract: string) =>
    `${this.coreApiUrl}${this.contractAbiEndpoint}/${address}/${contract}`;
  getReadOnlyFunctionCallApiUrl = (
    contractAddress: string,
    contractName: string,
    functionName: string
  ) =>
    `${this.coreApiUrl}${
      this.readOnlyFunctionCallEndpoint
    }/${contractAddress}/${contractName}/${encodeURIComponent(functionName)}`;
  getInfoUrl = () => `${this.coreApiUrl}/v2/info`;
  getBlockTimeInfoUrl = () => `${this.coreApiUrl}/extended/v1/info/network_block_times`;
  getPoxInfoUrl = () => `${this.coreApiUrl}/v2/pox`;
  getRewardsUrl = (address: string, options?: any) => {
    let url = `${this.coreApiUrl}/extended/v1/burnchain/rewards/${address}`;
    if (options) {
      url = `${url}?limit=${options.limit}&offset=${options.offset}`;
    }
    return url;
  };
  getRewardsTotalUrl = (address: string) =>
    `${this.coreApiUrl}/extended/v1/burnchain/rewards/${address}/total`;
  getRewardHoldersUrl = (address: string, options?: any) => {
    let url = `${this.coreApiUrl}/extended/v1/burnchain/reward_slot_holders/${address}`;
    if (options) {
      url = `${url}?limit=${options.limit}&offset=${options.offset}`;
    }
    return url;
  };
  getStackerInfoUrl = (contractAddress: string, contractName: string) =>
    `${this.coreApiUrl}${this.readOnlyFunctionCallEndpoint}
    ${contractAddress}/${contractName}/get-stacker-info`;
  getDataVarUrl = (contractAddress: string, contractName: string, dataVarName: string) =>
    `${this.coreApiUrl}/v2/data_var/${contractAddress}/${contractName}/${dataVarName}?proof=0`;
  getMapEntryUrl = (contractAddress: string, contractName: string, mapName: string) =>
    `${this.coreApiUrl}/v2/map_entry/${contractAddress}/${contractName}/${mapName}?proof=0`;
  getNameInfo(fullyQualifiedName: string) {
    /*
      TODO: Update to v2 API URL for name lookups
    */
    const nameLookupURL = `${this.bnsLookupUrl}/v1/names/${fullyQualifiedName}`;
    return this.fetchFn(nameLookupURL)
      .then(resp => {
        if (resp.status === 404) {
          throw new Error('Name not found');
        } else if (resp.status !== 200) {
          throw new Error(`Bad response status: ${resp.status}`);
        } else {
          return resp.json();
        }
      })
      .then(nameInfo => {
        // the returned address _should_ be in the correct network ---
        //  stacks node gets into trouble because it tries to coerce back to mainnet
        //  and the regtest transaction generation libraries want to use testnet addresses
        if (nameInfo.address) {
          return Object.assign({}, nameInfo, { address: nameInfo.address });
        } else {
          return nameInfo;
        }
      });
  }
}

/**
 * A {@link StacksNetwork} with the parameters for the Stacks mainnet.
 * Pass a `url` option to override the default Hiro hosted Stacks node API.
 * Pass a `fetchFn` option to customize the default networking functions.
 * @example
 * ```
 * const network = new StacksMainnet();
 * const network = new StacksMainnet({ url: "https://api.mainnet.hiro.so" });
 * const network = new StacksMainnet({ fetch: createFetchFn() });
 * ```
 * @related {@link createFetchFn}, {@link createApiKeyMiddleware}
 */
export class StacksMainnet extends StacksNetwork {
  version = TransactionVersion.Mainnet;
  chainId = ChainID.Mainnet;

  constructor(opts?: Partial<NetworkConfig>) {
    super({
      url: opts?.url ?? HIRO_MAINNET_DEFAULT,
      fetchFn: opts?.fetchFn,
    });
  }
}

/**
 * A {@link StacksNetwork} with the parameters for the Stacks testnet.
 * Pass a `url` option to override the default Hiro hosted Stacks node API.
 * Pass a `fetchFn` option to customize the default networking functions.
 * @example
 * ```
 * const network = new StacksTestnet();
 * const network = new StacksTestnet({ url: "https://api.testnet.hiro.so" });
 * const network = new StacksTestnet({ fetch: createFetchFn() });
 * ```
 * @related {@link createFetchFn}, {@link createApiKeyMiddleware}
 */
export class StacksTestnet extends StacksNetwork {
  version = TransactionVersion.Testnet;
  chainId = ChainID.Testnet;

  constructor(opts?: Partial<NetworkConfig>) {
    super({
      url: opts?.url ?? HIRO_TESTNET_DEFAULT,
      fetchFn: opts?.fetchFn,
    });
  }
}

/**
 * A {@link StacksNetwork} using the testnet parameters, but `localhost:3999` as the API URL.
 */
export class StacksMocknet extends StacksNetwork {
  version = TransactionVersion.Testnet;
  chainId = ChainID.Testnet;

  constructor(opts?: Partial<NetworkConfig>) {
    super({
      url: opts?.url ?? HIRO_MOCKNET_DEFAULT,
      fetchFn: opts?.fetchFn,
    });
  }
}

/** Alias for {@link StacksMocknet} */
export const StacksDevnet = StacksMocknet;
