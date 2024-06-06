import React from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

import { ripemd160 } from '@noble/hashes/ripemd160';
import { sha256 } from '@noble/hashes/sha256';
import { base58 } from '@scure/base';
import { AnalyticsBrowser } from '@segment/analytics-next';
import * as Sentry from '@sentry/react';
import { token } from 'leather-styles/tokens';

import {
  IS_TEST_ENV,
  SEGMENT_WRITE_KEY,
  SENTRY_DSN,
  WALLET_ENVIRONMENT,
} from '@shared/environment';

export const analytics = new AnalyticsBrowser();

export function initAnalytics() {
  return analytics.load(
    { writeKey: SEGMENT_WRITE_KEY },
    {
      integrations: {
        'Segment.io': {
          deliveryStrategy: {
            strategy: 'batching',
            config: {
              size: 10,
              timeout: 5000,
            },
          },
        },
      },
    }
  );
}

// Used to create a unique identifier for a user's key in base58.
// K = ripemd160(sha256(publicKey))[:8]
export function deriveAnalyticsIdentifier(publicKey: Uint8Array) {
  return base58.encode(ripemd160(sha256(publicKey)).slice(0, 8));
}

export async function identifyUser(publicKey: Uint8Array) {
  return analytics.identify(deriveAnalyticsIdentifier(publicKey));
}

export function initSentry() {
  if (IS_TEST_ENV || !SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.75,
    integrations: [
      Sentry.browserTracingIntegration({}),
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.feedbackIntegration({
        colorScheme: 'system',
        isEmailRequired: false,
        buttonLabel: 'Give feedback',
        formTitle: 'Give feedback',
        autoInject: false,
        showEmail: false,
        showName: false,
        showBranding: false,
        messageLabel: 'Feedback',
        submitButtonLabel: 'Send feedback',
        messagePlaceholder:
          'This is not a support tool. To get help, follow the link in the main menu on the homepage.',
        successMessageText: 'Thanks for helping make Leather better',
        themeDark: {
          background: token('colors.ink.background-primary'),
          inputOutlineFocus: token('colors.ink.border-transparent'),
          submitBackground: token('colors.ink.component-background-default'),
          submitBackgroundHover: token('colors.ink.component-background-hover'),
          submitOutlineFocus: token('colors.ink.border-transparent'),
          submitBorder: token('colors.ink.component-background-default'),
          cancelBackground: token('colors.colorPalette.action-primary-default'),
          cancelBackgroundHover: token('colors.colorPalette.action-primary-hover'),
        },
        themeLight: {
          submitBackground: token('colors.ink.text-primary'),
          submitBackgroundHover: token('colors.ink.text-primary'),
          submitOutlineFocus: token('colors.ink.text-primary'),
        },
      }),
    ],
    ignoreErrors: [
      // Harmless error
      'ResizeObserver loop limit exceeded',
      /ResizeObserver/,
      // Failed network requests needn't be tracked
      'Network request failed',
    ],
    environment: WALLET_ENVIRONMENT,
    autoSessionTracking: false,
    async beforeSend(event) {
      delete event.user?.ip_address;
      delete event.extra?.ip_address;

      const values = event.exception?.values?.map(({ value }) => value);

      // @see https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
      if (values?.includes('ResizeObserver loop limit exceeded')) {
        return null;
      }
      return event;
    },
  });
}
