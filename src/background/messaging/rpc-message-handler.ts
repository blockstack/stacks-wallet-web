// import { RpcErrorCode } from '@btckit/types';
import { RouteUrls } from '@shared/route-urls';
import { WalletRequests } from '@shared/rpc/rpc-methods';

import {
  // getTabIdFromPort,
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from './messaging-utils';

export async function rpcMessageHandler(message: WalletRequests, port: chrome.runtime.Port) {
  switch (message.method) {
    case 'getAddresses': {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [['requestId', message.id]]);
      const { id } = await triggerRequestWindowOpen(RouteUrls.RpcGetAddresses, urlParams);
      listenForPopupClose({ tabId, id, response: { id: message.id, result: null } });
      break;
    }
    // case 'sendTransfer': {
    //   if (!message.params) {
    //     chrome.tabs.sendMessage(
    //       getTabIdFromPort(port),
    //       makeRpcErrorResponse('sendTransfer', {
    //         id: message.id,
    //         error: {
    //           code: RpcErrorCode.INVALID_PARAMS,
    //           message:
    //             'Invalid parameters. See the btckit spec for more information: https://btckit.org/docs/spec',
    //         },
    //       })
    //     );
    //     break;
    //   }
    //   const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [
    //     ['address', message.params.address],
    //     ['amount', message.params.amount],
    //     ['requestId', message.id],
    //   ]);
    //   const { id } = await triggerRequestWindowOpen(RouteUrls.RpcSendTransfer, urlParams);
    //   listenForPopupClose({
    //     tabId,
    //     id,
    //     response: makeRpcErrorResponse('sendTransfer', {
    //       id: message.id,
    //       error: {
    //         code: RpcErrorCode.USER_REJECTION,
    //         message: 'User rejected signing the transaction',
    //       },
    //     }),
    //   });
    //   break;
    // }
  }
}
