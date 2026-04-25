'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Analytics configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

type AnalyticsEventParams = Record<string, unknown>;
type Gtag = (
  command: 'config' | 'event' | 'js',
  target: string | Date,
  params?: AnalyticsEventParams
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    plausible?: (eventName: string, options?: { props?: AnalyticsEventParams }) => void;
  }
}

/**
 * Analytics component
 * Hỗ trợ Google Analytics và Plausible Analytics
 */
export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    if (pathname) {
      // Google Analytics pageview
      if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
        });
      }

      // Plausible pageview (tự động track, không cần code)
    }
  }, [pathname, searchParams]);

  return (
    <>
      {/* Google Analytics */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Plausible Analytics */}
      {PLAUSIBLE_DOMAIN && (
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}

/**
 * Track custom event
 * @param eventName - Tên event
 * @param eventParams - Parameters của event
 */
export function trackEvent(eventName: string, eventParams?: AnalyticsEventParams) {
  // Google Analytics event
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }

  // Plausible event
  if (PLAUSIBLE_DOMAIN && typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props: eventParams });
  }
}
