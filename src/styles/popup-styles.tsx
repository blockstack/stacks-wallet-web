import { css } from '@emotion/react';

export const popupStyles = css`
  .mode__popup {
    &,
    body {
      height: unset !important;
      min-height: 552px !important;
      min-width: 440px !important;
      overflow-x: hidden;
    }

    .installed-page {
      .content-image .image-large {
        display: none;
      }

      .content-text {
        .title {
          width: 264px;
          font-size: 32px;
          line-height: 44px;
          margin-top: 24px;
        }

        .text {
          margin-bottom: 16px;
        }
      }
    }
  }
`;
