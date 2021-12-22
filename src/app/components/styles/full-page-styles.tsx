import { css } from '@emotion/react';

export const fullPageStyles = css`
  .mode__full-page {
    &,
    body {
      height: 100%;
      max-height: unset;
      width: 100%;
    }
    main.main-content {
      flex-direction: row;
      flex-grow: 1;
      justify-content: center;
      margin: 0 auto;
    }
    .temp {
      max-width: 440px;
    }
    .onboarding-text {
      text-align: center;
    }
  }
`;
