import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InputSelect from "@/components/ui/input/InputSelect";
import { TenantDto } from "@/db/models";
import { usePathname, useRouter } from "next/navigation";
import { AppDataDto } from "@/lib/state/useAppData";

export default function TenantSelector({ appData }: { appData: AppDataDto }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const [selected, setSelected] = useState(appData.currentTenant?.slug);

  const tenants: { tenant: TenantDto }[] = [
    ...appData.myTenants.map((tenant) => {
      return {
        tenant,
      };
    }),
  ];

  useEffect(() => {
    if (selected) {
      const tenant = tenants.find((f) => f.tenant.slug === selected);
      if (tenant) {
        router.push(
          pathname
            .replace(`/app/${appData.currentTenant.slug}`, `/app/${tenant.tenant.slug}`)
            .replace(`/app/${appData.currentTenant.id}`, `/app/${tenant.tenant.slug}`)
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  function getAllTenants() {
    const items = tenants
      .map((f) => {
        let group = t("models.tenant.plural");
        return {
          group,
          value: f.tenant.slug,
          name: f.tenant.name,
          img: f.tenant.icon ? (
            <img className="inline-block h-6 w-6 shrink-0 rounded-md bg-gray-700 shadow-sm" src={f.tenant.icon} alt={f.tenant.name} />
          ) : (
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary">
              <span className="text-theme-200 text-xs font-medium leading-none">{f.tenant?.name.substring(0, 1)}</span>
            </span>
          ),
          // link: pathname.replace(`/app/${appData.currentTenant.slug}`, `/app/${f?.slug}`),
        };
      })
      .sort((a, b) => a.group.localeCompare(b.group));
    // return unique slugs
    const unique = items.filter((item, index, self) => self.findIndex((t) => t.value === item.value) === index);
    return unique;
  }

  if (!appData.currentTenant) {
    return null;
  }

  return (
    <div className="dark">
      {tenants.length > 1 && (
        <InputSelect className="dark text-foreground" value={selected} options={getAllTenants()} onChange={(e) => setSelected(e?.toString() ?? "")} />
      )}
    </div>
  );
}
