import { Square, SquareProps } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';

import { Svg } from '../svg';

export function ErrorCircleIcon({ size = token('icons.icon.sm'), ...props }: SquareProps) {
  return (
    <Square size={size} {...props}>
      <Svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.00004 14.6666C11.6819 14.6666 14.6667 11.6818 14.6667 7.99992C14.6667 4.31802 11.6819 1.33325 8.00004 1.33325C4.31814 1.33325 1.33337 4.31802 1.33337 7.99992C1.33337 11.6818 4.31814 14.6666 8.00004 14.6666Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        />
        <path d="M8 6V8.66667" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
        <path
          d="M8 11.3334H8.00667"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="square"
        />
      </Svg>
    </Square>
  );
}
