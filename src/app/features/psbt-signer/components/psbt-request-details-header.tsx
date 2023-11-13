import { Box, HStack, styled } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';

import { Tooltip } from '@app/components/tooltip';
import { usePsbtSignerContext } from '@app/features/psbt-signer/psbt-signer.context';
import { LockIcon } from '@app/ui/components/icons/lock-icon';
import { UnlockIcon } from '@app/ui/components/icons/unlock-icon';

const immutableLabel =
  'Any modification to the transaction, including the fee amount or other inputs/outputs, will invalidate the signature.';
const uncertainLabel =
  'The transaction details can be altered by other participants. This means the final outcome of the transaction might be different than initially agreed upon.';

export function PsbtRequestDetailsHeader() {
  const { isPsbtMutable } = usePsbtSignerContext();
  const tokenLabelColor = isPsbtMutable
    ? token('colors.warning.label')
    : token('colors.accent.text-subdued');

  return (
    <HStack alignItems="center" gap="space.02">
      <styled.h2 textStyle="heading.05">Transaction</styled.h2>
      <Tooltip
        label={isPsbtMutable ? uncertainLabel : immutableLabel}
        maxWidth="230px"
        placement="bottom"
      >
        <HStack
          alignItems="center"
          border={isPsbtMutable ? 'warning' : 'subdued'}
          borderRadius="24px"
          gap="space.01"
          px="space.02"
          py="space.01"
        >
          <Box width="12px">
            {isPsbtMutable ? (
              <UnlockIcon style={{ color: tokenLabelColor }} size={token('icons.icon.xs')} />
            ) : (
              <LockIcon style={{ color: tokenLabelColor }} size={token('icons.icon.xs')} />
            )}
          </Box>
          <styled.span
            color={isPsbtMutable ? 'warning.label' : 'accent.text-subdued'}
            textStyle="caption.02"
          >
            {isPsbtMutable ? 'Uncertain' : 'Certain'}
          </styled.span>
        </HStack>
      </Tooltip>
    </HStack>
  );
}
