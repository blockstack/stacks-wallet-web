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

    .installed-page {
      .content-image {
        order: 2;
        height: calc(100vh - 102px);

        .image-small {
          display: none;
        }
      }

      .content-text {
        order: 1;
        margin-left: 168px;

        .title {
          max-width: 500px;
          font-size: 64px;
          margin-bottom: 24px;
        }

        .text {
          max-width: 440px;
          font-size: 16px;
          margin-bottom: 24px;
        }
      }
    }

    .onboarding-text {
      text-align: center;
    }
  }
`;
