/* eslint-disable @next/next/no-img-element */

'use client'

import useRootData from '@/lib/state/useRootData'

export default function ScriptAnalytics() {
  const rootData = useRootData()
  if (rootData.debug) {
    return null
  }
  return (
    <>
      {rootData.appConfiguration?.analytics.simple_analytics && (
        <>
          <script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
          <noscript>
            <img
              src="https://queue.simpleanalyticscdn.com/noscript.gif"
              alt="privacy-friendly-simpleanalytics"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </noscript>
        </>
      )}

      {rootData.appConfiguration?.analytics.plausible_analytics && (
        <>
          <script
            defer
            data-domain={rootData.domainName}
            src="https://plausible.io/js/script.js"
          ></script>
        </>
      )}

      <>
        {rootData.appConfiguration?.analytics.google_analytics_tracking_id && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${rootData.appConfiguration?.analytics.google_analytics_tracking_id}`}
            />
            <script
              async
              id="gtag-init"
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${rootData.appConfiguration?.analytics.google_analytics_tracking_id}', {
                  page_path: window.location.pathname,
                });
              `,
              }}
            />
          </>
        )}
      </>
    </>
  )
}
