import { Box, BoxProps } from '@stacks/ui';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { Link } from '@app/components/link';
import { Caption } from '@app/components/typography';

interface DisclaimerProps extends BoxProps {
  disclaimerText: string;
  learnMoreUrl?: string;
}
export function Disclaimer({ disclaimerText, learnMoreUrl, ...props }: DisclaimerProps) {
  return (
    <Box lineHeight="1.4" {...props}>
      <Caption>
        {disclaimerText}
        {learnMoreUrl ? (
          <Link display="inline" fontSize="14px" onClick={() => openInNewTab(learnMoreUrl)}>
            {' '}
            Learn more
          </Link>
        ) : null}
        {learnMoreUrl ? '.' : null}
      </Caption>
    </Box>
  );
}
