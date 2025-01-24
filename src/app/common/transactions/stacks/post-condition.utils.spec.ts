import {
  type NonFungiblePostCondition,
  hexToCV,
  parsePrincipalString,
  postConditionToWire,
} from '@stacks/transactions';

import { handlePostConditions } from '@app/common/transactions/stacks/post-condition.utils';

const SENDER_ADDRESS = 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW';

const mockPostCondition: NonFungiblePostCondition = {
  type: 'nft-postcondition',
  address: SENDER_ADDRESS,
  condition: 'sent',
  asset: 'ST248HH800501WYSG7Z2SS1ZWHQW1GGH85Q6YJBCC.passive-blue-marmot::layer-nft',
  assetId: hexToCV('0x0100000000000000000000000000000003'),
};

describe(handlePostConditions.name, function () {
  it('should not modify a post condition where the principal is a contract', () => {
    const transformedPostCondition = handlePostConditions(
      [postConditionToWire(mockPostCondition)],
      SENDER_ADDRESS,
      SENDER_ADDRESS
    );
    expect(transformedPostCondition[0]).toEqual(mockPostCondition);
  });

  it('should not modify a post condition when all addresses are the same (sender, current address, and postcondition principal)', () => {
    const transformedPostCondition = handlePostConditions(
      [postConditionToWire(mockPostCondition)],
      SENDER_ADDRESS,
      SENDER_ADDRESS
    );
    expect(transformedPostCondition[0]).toEqual(mockPostCondition);
  });

  it('should modify a post condition when currentAddress is different, but payload address is of the same type as the principal in the post condition', () => {
    const CURRENT_ADDRESS = 'ST248HH800501WYSG7Z2SS1ZWHQW1GGH85Q6YJBCC';
    const transformedPostCondition = handlePostConditions(
      [postConditionToWire(mockPostCondition)],
      SENDER_ADDRESS,
      CURRENT_ADDRESS
    );
    const principal = transformedPostCondition[0].principal;
    const principalAddress = 'address' in principal ? principal.address : '';
    expect(principalAddress).toEqual(parsePrincipalString(CURRENT_ADDRESS).address);
  });

  it('should not modify a post condition when currentAddress is same, but payload address is different type as the principal in the post condition', () => {
    const PAYLOAD_ADDRESS = 'ST248HH800501WYSG7Z2SS1ZWHQW1GGH85Q6YJBCC';
    const transformedPostCondition = handlePostConditions(
      [postConditionToWire(mockPostCondition)],
      PAYLOAD_ADDRESS,
      SENDER_ADDRESS
    );
    const principal = transformedPostCondition[0].principal;
    const principalAddress = 'address' in principal ? principal.address : '';
    expect(principalAddress).toEqual(parsePrincipalString(SENDER_ADDRESS).address);
  });
});
