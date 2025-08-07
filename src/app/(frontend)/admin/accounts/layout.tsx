import { useTranslation } from "react-i18next";
import MembershipCardIcon from "@/components/ui/icons/MembershipCardIcon";
import UserGroupIcon from "@/components/ui/icons/UserGroupIcon";
import UserGroupIconFilled from "@/components/ui/icons/UserGroupIconFilled";
import KeyIcon from "@/components/ui/icons/KeyIcon";
import KeyIconFilled from "@/components/ui/icons/KeyIconFilled";
import MembershipCardIconFilled from "@/components/ui/icons/MembershipCardIconFilled";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";
import { getServerTranslations } from "@/i18n/server";

export default async function ({ children }: { children: React.ReactNode }) {
  const { t } = await getServerTranslations();
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: t("admin.tenants.title"),
          href: "/admin/accounts",
          exact: true,
          icon: <MembershipCardIcon className="h-5 w-5" />,
          iconSelected: <MembershipCardIconFilled className="h-5 w-5" />,
        },
        {
          name: t("models.user.plural"),
          href: "/admin/accounts/users",
          icon: <UserGroupIcon className="h-5 w-5" />,
          iconSelected: <UserGroupIconFilled className="h-5 w-5" />,
        },
        {
          name: t("app.sidebar.rolesAndPermissions"),
          href: "/admin/accounts/roles-and-permissions",
          icon: <KeyIcon className="h-5 w-5" />,
          iconSelected: <KeyIconFilled className="h-5 w-5" />,
        },
      ]}
    >
      {children}
    </SidebarIconsLayout>
  );
}
