'use client'

import SlideOverWideEmpty from '@/components/ui/slideOvers/SlideOverWideEmpty'
import NewMember from '@/modules/accounts/components/members/NewMember'
import { PlanFeatureUsageDto } from '@/modules/subscriptions/dtos/PlanFeatureUsageDto'
import { useParams, useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { actionAppSettingsMembersNew } from '@/app/(frontend)/(app)/app/[tenant]/actions'

export default function ({
  data,
}: {
  data: { featurePlanUsage: PlanFeatureUsageDto | undefined }
}) {
  const router = useRouter()
  const params = useParams()
  const [actionData, action, pending] = useActionState(actionAppSettingsMembersNew, null)
  return (
    <SlideOverWideEmpty
      title={'New Member'}
      open={true}
      onClose={() => {
        // navigate(".", { replace: true });
        router.replace(`/app/${params.tenant}/settings/members`)
      }}
      className="sm:max-w-sm"
      overflowYScroll={true}
    >
      <div className="-mx-1 -mt-3">
        <div className="space-y-4">
          <NewMember
            featurePlanUsage={data.featurePlanUsage}
            serverAction={{ actionData, action, pending }}
          />
        </div>
      </div>
    </SlideOverWideEmpty>
  )
}
