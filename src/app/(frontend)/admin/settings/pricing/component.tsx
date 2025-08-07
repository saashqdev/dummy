"use client";

import { Fragment, useActionState, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import { PricingLoaderData as AdminPricingLoaderData } from "./page";
import { actionAdminPricing } from "./actions";
import useAdminData from "@/lib/state/useAdminData";
import { SubscriptionProductDto } from "@/modules/subscriptions/dtos/SubscriptionProductDto";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import InputSelect from "@/components/ui/input/InputSelect";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { SubscriptionFeatureDto } from "@/modules/subscriptions/dtos/SubscriptionFeatureDto";
import { PricingModel } from "@/modules/subscriptions/enums/PricingModel";
import clsx from "clsx";
import { TrashIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FloatingLoader from "@/components/ui/loaders/FloatingLoader";

export default function AdminPricingComponent({ data }: { data: AdminPricingLoaderData }) {
  const [actionData, action, pending] = useActionState(actionAdminPricing, null);
  const adminData = useAdminData();
  const { t } = useTranslation();

  const [selectedItems, setSelectedItems] = useState<SubscriptionProductDto[]>([]);

  const [model, setModel] = useState<PricingModel>(PricingModel.FLAT_RATE);
  const [items, setItems] = useState<SubscriptionProductDto[]>([]);
  const [, setAllFeatures] = useState<SubscriptionFeatureDto[]>([]);

  useEffect(() => {
    if (data.items.filter((f) => f.id).length > 0) {
      setItems(data.items);
    } else {
      setItems(data.items.filter((f) => f.model === model || model === PricingModel.ALL));
    }
  }, [data.items, model]);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  useEffect(() => {
    const allFeatures: SubscriptionFeatureDto[] = [];
    items.forEach((item) => {
      item.features.forEach((feature) => {
        const existing = allFeatures.find((f) => f.name === feature.name);
        if (!existing) {
          allFeatures.push({
            order: feature.order,
            name: feature.name,
            title: feature.title,
            type: feature.type,
            value: feature.value,
            accumulate: feature.accumulate,
          });
        }
      });
    });
    setAllFeatures(allFeatures.sort((a, b) => a.order - b.order));
  }, [items]);

  const sortedItems = () => {
    return items.sort((x, y) => {
      return x?.order > y?.order ? 1 : -1;
    });
  };

  function createAllPlans() {
    const form = new FormData();
    form.set("action", "create-all-plans");
    form.set("model", model.toString());
    action(form);
  }

  function createdPlans() {
    return data.items.filter((f) => f.id).length;
  }

  return (
    <IndexPageLayout
      title={t("admin.pricing.title")}
      buttons={
        <>
          <div className="flex justify-between space-x-2">
            <form action={action} className="flex h-9 items-center space-x-2">
              {selectedItems.length > 0 && (
                <DeleteIconButton
                  items={selectedItems}
                  isDeleting={pending}
                  onClick={() => {
                    const form = new FormData();
                    form.set("action", "bulk-delete");
                    selectedItems.forEach((item) => {
                      form.append("ids[]", item.id?.toString() ?? "");
                    });
                    action(form);
                  }}
                />
              )}
              {data.items.filter((f) => f.id).length > 0 && (
                <ButtonSecondary
                  disabled={data.items.filter((f) => f.id).length === 0}
                  to={`/admin/settings/pricing/features?` + selectedItems.map((f) => "id=" + f.id).join("&")}
                  className="hidden sm:block"
                >
                  Set features
                </ButtonSecondary>
              )}
              {selectedItems.length === 0 && (
                <Fragment>
                  <ButtonSecondary disabled={pending} to="/pricing" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <div>{t("shared.preview")}</div>
                  </ButtonSecondary>
                  {/* <ButtonSecondary disabled={pending} to=".">
              {t("shared.reload")}
            </ButtonSecondary> */}

                  <ButtonPrimary to="/admin/settings/pricing/new" disabled={pending || !getUserHasPermission(adminData, "admin.pricing.create")}>
                    {t("shared.new")}
                  </ButtonPrimary>
                </Fragment>
              )}
            </form>
          </div>
        </>
      }
    >
      {createdPlans() === 0 && (
        <WarningBanner title={t("shared.warning")} text={t("admin.pricing.thesePricesAreFromFiles")}>
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-44">
              <InputSelect
                name="model"
                value={model}
                onChange={(e) => {
                  setModel(Number(e));
                }}
                options={[
                  {
                    name: t("pricing." + PricingModel[PricingModel.FLAT_RATE]),
                    value: PricingModel.FLAT_RATE,
                  },
                  {
                    name: t("pricing." + PricingModel[PricingModel.PER_SEAT]),
                    value: PricingModel.PER_SEAT,
                  },
                  {
                    name: t("pricing." + PricingModel[PricingModel.USAGE_BASED]),
                    value: PricingModel.USAGE_BASED,
                  },
                  {
                    name: t("pricing." + PricingModel[PricingModel.FLAT_RATE_USAGE_BASED]),
                    value: PricingModel.FLAT_RATE_USAGE_BASED,
                  },
                  {
                    name: t("pricing." + PricingModel[PricingModel.ONCE]),
                    value: PricingModel.ONCE,
                  },
                  {
                    name: t("shared.all"),
                    value: PricingModel.ALL,
                  },
                ]}
              />
            </div>
            <ButtonSecondary
              type="button"
              onClick={createAllPlans}
              disabled={pending || createdPlans() > 0 || !getUserHasPermission(adminData, "admin.pricing.create")}
              isLoading={pending}
              className="bg-yellow-500 text-yellow-900 hover:bg-yellow-400"
            >
              {t("admin.pricing.generateFromFiles")}
            </ButtonSecondary>
          </div>
        </WarningBanner>
      )}

      <TableSimple
        selectedRows={selectedItems}
        onSelected={(items) => setSelectedItems(items)}
        items={sortedItems()}
        headers={[
          {
            name: "order",
            title: t("models.subscriptionProduct.order"),
            value: (i) => i.order,
          },
          {
            name: "title",
            title: t("models.subscriptionProduct.title"),
            value: (item) => (
              <>
                {t(item.title)}{" "}
                {item.badge && <span className="border-theme-200 bg-theme-50 text-theme-800 ml-1 rounded-md border px-1 py-0.5 text-xs">{t(item.badge)}</span>}
              </>
            ),
          },
          {
            name: "model",
            title: t("models.subscriptionProduct.model"),
            value: (item) => <>{t("pricing." + PricingModel[item.model])}</>,
          },
          {
            name: "subscriptions",
            title: t("models.subscriptionProduct.plural"),
            value: (item) => (
              <div className="lowercase text-gray-400">
                {item.tenantProducts?.length ?? 0} {t("shared.active")}
              </div>
            ),
          },
          {
            name: "active",
            title: t("models.subscriptionProduct.status"),
            value: (item) => (
              <>
                {item.active ? (
                  <Fragment>
                    {item.public ? (
                      <Badge variant="outline">{t("models.subscriptionProduct.public")}</Badge>
                    ) : (
                      <Badge variant="secondary">{t("models.subscriptionProduct.custom")}</Badge>
                    )}
                  </Fragment>
                ) : (
                  <Badge variant="outline">{t("shared.inactive")}</Badge>
                )}
              </>
            ),
          },
          {
            title: "",
            value: (item) => (
              <div className="flex items-center space-x-2">
                <ButtonTertiary disabled={!item.id} to={"/pricing?plan=" + item.id} target="_blank">
                  {t("shared.preview")}
                </ButtonTertiary>
                <ButtonTertiary disabled={!item.id} to={`/admin/settings/pricing/edit/${item.id}`}>
                  {t("shared.edit")}
                </ButtonTertiary>
              </div>
            ),
          },
        ]}
      />

      {pending && <FloatingLoader loading={true} />}
    </IndexPageLayout>
  );
}

function DeleteIconButton({
  onClick,
  items,
  isDeleting,
}: {
  onClick: () => void;
  items: SubscriptionProductDto[];

  isDeleting: boolean;
}) {
  const { t } = useTranslation();
  const confirmModal = useRef<RefConfirmModal>(null);
  function onDeleting() {
    const hasWithSub = items.some((f) => (f.tenantProducts?.length ?? 0) > 0);
    if (hasWithSub) {
      toast.error("You cannot delete a plan with active subscriptions: " + items.map((f) => t(f.title ?? "")).join(", "));
    } else {
      confirmModal.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
    }
  }
  return (
    <Fragment>
      <button
        type="button"
        className={clsx(
          "group flex items-center rounded-md border border-transparent px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
          isDeleting && "base-spinner"
        )}
        disabled={isDeleting}
        onClick={onDeleting}
      >
        <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
      </button>
      <ConfirmModal ref={confirmModal} onYes={onClick} destructive />
    </Fragment>
  );
}
