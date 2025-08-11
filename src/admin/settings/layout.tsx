import IconAnalytics from "@/components/layouts/icons/IconAnalytics";
import IconKeys from "@/components/layouts/icons/IconKeys";
import CacheIcon from "@/components/ui/icons/CacheIcon";
import CurrencyIcon from "@/components/ui/icons/CurrencyIcon";
import EmailIcon from "@/components/ui/icons/EmailIcon";
import ExclamationTriangleIcon from "@/components/ui/icons/ExclamationTriangleIcon";
import GearIcon from "@/components/ui/icons/GearIcon";
import GearIconFilled from "@/components/ui/icons/GearIconFilled";
import UserIcon from "@/components/ui/icons/UserIcon";
import MegaphoneIcon from "@/components/ui/icons/MegaphoneIcon";
import MegaphoneIconFilled from "@/components/ui/icons/MegaphoneIconFilled";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";
import { getServerTranslations } from "@/i18n/server";

export default async function ({ children }: { children: React.ReactNode }) {
  const { t } = await getServerTranslations();
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: t("settings.admin.profile.title"),
          // description: t("settings.admin.profile.description"),
          href: "/admin/settings/profile",
          icon: <UserIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />,
          iconSelected: <UserIcon className="h-5 w-5 flex-shrink-0 text-foreground" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.general.title"),
          // description: t("settings.admin.general.description"),
          href: "/admin/settings/general",
          icon: <GearIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />,
          iconSelected: <GearIconFilled className="h-5 w-5 flex-shrink-0 text-foreground" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.pricing.title"),
          // description: t("settings.admin.pricing.description"),
          href: "/admin/settings/pricing",
          icon: <CurrencyIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />,
          iconSelected: <CurrencyIcon className="h-5 w-5 flex-shrink-0 text-foreground" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.authentication.title"),
          // description: t("settings.admin.authentication.description"),
          href: "/admin/settings/authentication",
          icon: <IconKeys className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />,
          iconSelected: <IconKeys className="h-5 w-5 flex-shrink-0 text-foreground" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.analytics.title"),
          // description: t("settings.admin.analytics.description"),
          href: "/admin/settings/analytics",
          icon: <IconAnalytics className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />,
          iconSelected: <IconAnalytics className="h-5 w-5 flex-shrink-0 text-foreground" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.transactionalEmails.title"),
          // description: t("settings.admin.transactionalEmails.description"),
          href: "/admin/settings/emails",
          icon: <EmailIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />,
          iconSelected: <EmailIcon className="h-5 w-5 flex-shrink-0 text-foreground" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.cache.title"),
          // description: t("settings.admin.cache.description"),
          href: "/admin/settings/cache",
          icon: <CacheIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />,
          iconSelected: <CacheIcon className="h-5 w-5 flex-shrink-0 text-foreground" aria-hidden="true" />,
        },
        {
          name: t("affiliates.title"),
          href: "/admin/settings/affiliates",
          icon: <MegaphoneIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />,
          iconSelected: <MegaphoneIconFilled className="h-5 w-5 flex-shrink-0 text-foreground" aria-hidden="true" />,
        },
        {
          name: t("settings.admin.danger.title"),
          // description: t("settings.admin.danger.description"),
          href: "/admin/settings/danger",
          icon: <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />,
          iconSelected: <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-foreground" aria-hidden="true" />,
          bottom: true,
        },
      ]}
    >
      {children}
    </SidebarIconsLayout>
  );
}
