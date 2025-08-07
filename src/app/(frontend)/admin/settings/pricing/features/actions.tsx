"use server";

import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { db } from "@/db";
import { SubscriptionFeatureInPlansDto } from "@/modules/subscriptions/dtos/SubscriptionFeatureInPlansDto";
import { clearSubscriptionsCache } from "@/modules/subscriptions/services/SubscriptionService";
import { revalidatePath } from "next/cache";

type ActionData = {
  success?: string;
  error?: string;
};
export const actionPricingFeatures = async (prev: any, form: FormData) => {
  await verifyUserHasPermission("admin.pricing.update");

  const action = form.get("action")?.toString();
  if (action === "update-features") {
    const planIds = JSON.parse(form.get("planIds")?.toString() ?? "[]") as string[];
    const plans = await db.subscriptionProduct.getSubscriptionProductsInIds(planIds);
    if (plans.length === 0) {
      return { error: "No plans found" };
    }
    const featuresInPlans = JSON.parse(form.get("features")?.toString() ?? "[]") as SubscriptionFeatureInPlansDto[];
    await Promise.all(
      plans.map(async (plan) => {
        await db.subscriptionFeature.deleteBySubscriptionProductId(plan.id ?? "");
        const features = featuresInPlans.filter((f) => f.plans.find((p) => p.id === plan.id));
        await Promise.all(
          features
            .sort((a, b) => a.order - b.order)
            .map(async ({ order, name, href, badge, plans, accumulate }) => {
              const feature = plans.find((p) => p.id === plan.id);
              if (!feature) {
                return;
              }
              return await db.subscriptionFeature.create(plan.id ?? "", {
                order,
                name,
                title: feature.title,
                type: feature.type,
                value: feature.value,
                href,
                badge,
                accumulate,
              });
            })
        );
      })
    );
    await clearSubscriptionsCache();
    revalidatePath("/admin/settings/pricing/features");
    return { success: "Features updated" };
  }
  return { error: "Invalid action" };
};
