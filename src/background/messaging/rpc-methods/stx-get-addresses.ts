import { RpcErrorCode, type StxGetAddressesRequest } from '@leather.io/rpc';

import { RouteUrls } from '@shared/route-urls';
import { makeRpcErrorResponse } from '@shared/rpc/rpc-methods';

import {
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from '../messaging-utils';
import { trackRpcRequestSuccess } from '../rpc-message-handler';

export async function rpcStxGetAddresses(
  message: StxGetAddressesRequest,
  port: chrome.runtime.Port
) {
  const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [['requestId', message.id]]);
  const { id } = await triggerRequestWindowOpen(RouteUrls.RpcGetAddresses, urlParams);
  void trackRpcRequestSuccess({ endpoint: message.method });

  listenForPopupClose({
    tabId,
    id,
    response: makeRpcErrorResponse('stx_getAddresses', {
      id: message.id,
      error: {
        code: RpcErrorCode.USER_REJECTION,
        message: 'User rejected request to get addresses',
      },
    }),
  });
}
