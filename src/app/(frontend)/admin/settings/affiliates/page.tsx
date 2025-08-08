import IndexPageLayout from '@/components/ui/layouts/IndexPageLayout'
import React from 'react'
import { getServerTranslations } from '@/i18n/server'
import { defaultSiteTags, getMetaTags } from '@/modules/pageBlocks/seo/SeoMetaTagsUtils'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return getMetaTags({
    title: `${t('affiliates.title')} | ${defaultSiteTags.title}`,
  })
}

export default async function () {
  const { t } = await getServerTranslations()
  return (
    <IndexPageLayout title={t('affiliates.title')}>
      <div className="space-y-2">
        <div className="prose">
          <ol className="space-y-2">
            <li>
              Create a Rewardful account (use{' '}
              <a
                href="https://www.rewardful.com/?via=world"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                my link
              </a>{' '}
              and get a discount).
            </li>
            <li>
              Open the file:{' '}
              <code className="font-bold text-blue-800">
                src/modules/core/data/defaultAppConfiguration.ts
              </code>
              .
            </li>
            <li>
              Set <b>affiliates.providers.rewardfulApiKey</b>{' '}
              <i>(you can find it in your Rewardful company settings)</i>.
            </li>
            <li>
              Set <b>affiliates.signUpLink</b> <i>(i.e. https://world.getrewardful.com/signup)</i>.
            </li>
            <li>
              Set <b>affiliates.percentage</b> and <b>affiliates.plans</b>.
            </li>
            <li>Create a campaign.</li>
            <li>Add yourself as an affiliate.</li>
            <li>
              Using the affiliate link, create a new account by subscribing to a plan (you can
              create a 100% off coupon for testing in production).
            </li>
            <li>
              {
                "Go to your stripe dashboard and confirm that the customer has metadata with the affiliate's ID."
              }
            </li>
            <li>{"Check the affiliate's dashboard to see the commission."}</li>
            <li>{"And that's it 🎉!"}</li>
          </ol>
        </div>
      </div>
    </IndexPageLayout>
  )
}
