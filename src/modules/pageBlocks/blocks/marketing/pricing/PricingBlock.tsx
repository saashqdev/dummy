import { useActionState } from 'react'
import { PricingBlockDto } from './PricingBlockDto'
import PricingVariantSimple from './PricingVariantSimple'
import { actionPricing } from '@/app/(frontend)/(marketing)/pricing/page'

export default function PricingBlock({ item }: { item: PricingBlockDto }) {
  const [actionData, action, pending] = useActionState(actionPricing, null)
  return (
    <>
      {item.style === 'simple' && (
        <PricingVariantSimple item={item} serverAction={{ actionData, action, pending }} />
      )}
    </>
  )
}
