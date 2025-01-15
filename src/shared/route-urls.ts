export enum RouteUrls {
  // Onboarding routes
  Onboarding = '/get-started',
  BackUpSecretKey = '/back-up-secret-key',
  SetPassword = '/set-password',
  SignIn = '/sign-in',

  // Ledger routes
  ConnectLedger = 'connect-your-ledger',
  ConnectLedgerError = 'ledger-connection-error',
  ConnectLedgerSuccess = 'successfully-connected-your-ledger',
  DeviceBusy = 'please-wait',
  AwaitingDeviceUserAction = 'awaiting-approval',
  LedgerDisconnected = 'your-ledger-disconnected',
  LedgerOperationRejected = 'action-rejected',
  LedgerPublicKeyMismatch = 'wrong-ledger-device',
  LedgerDevicePayloadInvalid = 'ledger-payload-invalid',
  LedgerUnsupportedBrowser = 'unsupported-browser',
  LedgerOutdatedAppWarning = 'outdated-app-warning',
  LedgerBroadcastError = 'transaction-broadcast-error',
  ConnectLedgerStart = 'connect-ledger',

  // Active wallet routes
  Home = '/',
  AddNetwork = '/add-network',
  EditNetwork = '/edit-network',
  Fund = '/fund/:currency',
  FundChooseCurrency = '/fund-choose-currency',
  IncreaseStacksFee = '/increase-fee/stacks/:txid',
  IncreaseBtcFee = '/increase-fee/btc',
  CancelStacksTransaction = '/cancel-transaction/stacks/:txid',
  Send = '/send-transaction',
  ViewSecretKey = '/view-secret-key',

  // nested routes must have relative paths
  Activity = '/activity',
  Receive = 'receive',
  ReceiveStx = 'receive/stx',
  ReceiveBtc = 'receive/btc',
  ReceiveBtcStamp = 'receive/btc-stamp',
  ReceiveCollectible = 'receive/collectible',
  ReceiveCollectibleOrdinal = 'receive/collectible/ordinal',

  // Locked wallet route
  Unlock = '/unlock',

  // Modal routes
  EditNonce = 'edit-nonce',
  SignOutConfirm = 'sign-out',
  RetrieveTaprootFunds = 'retrieve-taproot-funds',

  // Send crypto asset routes
  SendCryptoAsset = '/send',
  SendCryptoAssetForm = '/send/:symbol',
  SendSip10Form = '/send/:symbol/:contractId',
  SendCryptoAssetFormRecipientAccounts = 'recipient-accounts',
  SendCryptoAssetFormRecipientBns = 'recipient-bns',
  SendBtcChooseFee = '/send/btc/choose-fee',
  SendBtcError = '/send/btc/error',
  SendBtcConfirmation = '/send/btc/confirm',
  SendBtcDisabled = '/send/btc/disabled',
  SendStxConfirmation = '/send/stx/confirm',
  SendStacksSip10Confirmation = '/send/:symbol/confirm',
  SentBtcTxSummary = '/sent/btc/:txId',
  SentStxTxSummary = '/sent/stx/:txId',

  // Send ordinal inscriptions
  SendOrdinalInscription = 'send/ordinal-inscription',
  SendOrdinalInscriptionChooseFee = 'choose-fee',
  SendOrdinalInscriptionReview = 'review',
  SendOrdinalInscriptionSent = 'sent',
  SendOrdinalInscriptionError = 'error',

  // Swap routes
  Swap = '/swap/{chain}/:base/:quote?',
  SwapAssetSelectBase = 'select-base',
  SwapAssetSelectQuote = 'select-quote',
  SwapReview = '/swap/{chain}/:base/:quote/review',
  SwapError = '/swap/error',

  // Legacy request routes
  ProfileUpdateRequest = '/update-profile',
  PsbtRequest = '/psbt',
  SignatureRequest = '/signature',
  TransactionRequest = '/transaction',
  TransactionBroadcastError = 'broadcast-error',

  // Request routes bitcoin
  RpcGetAddresses = '/get-addresses',
  RpcSignPsbt = '/sign-psbt',
  RpcSignPsbtSummary = '/sign-psbt/summary',
  RpcSendTransfer = '/send-transfer',
  RpcSendTransferChooseFee = '/send-transfer/choose-fee',
  RpcSendTransferConfirmation = '/send-transfer/confirm',
  RpcSendTransferSummary = '/send-transfer/summary',
  RpcSignBip322Message = '/sign-bip322-message',
  RpcStacksSignature = '/sign-stacks-message',

  // Popup routes
  ChooseAccount = '/choose-account',

  // Shared legacy and rpc request routes
  RequestError = '/request-error',
  UnauthorizedRequest = '/unauthorized-request',

  // Request routes stacks
  RpcSignStacksTransaction = '/sign-stacks-transaction',
  RpcStxCallContract = '/stx-call-contract',
}
