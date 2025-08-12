import { getServerTranslations } from '@/i18n/server'
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps'
import { PricingBlockService } from '@/modules/pageBlocks/blocks/marketing/pricing/PricingBlockService.server'
import PageBlocks from '@/modules/pageBlocks/blocks/PageBlocks'
import { LandingPage } from '@/modules/pageBlocks/pages/LandingPage'

export async function generateMetadata() {
  const { t } = await getServerTranslations()
  return await LandingPage.metatags({ t })
}

export default async function (
  props: IServerComponentsProps,
  { children }: { children: React.ReactNode },
) {
  const searchParams = await props.searchParams
  const { t } = await getServerTranslations()
  const pricingBlockData = await PricingBlockService.load({ searchParams })
  return (
    <>
      <PageBlocks items={LandingPage.blocks({ data: { pricingBlockData }, t })} />
      <>{children}</>
    </>
  )
}
