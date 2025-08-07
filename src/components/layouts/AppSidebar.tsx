import IconAdmin from "@/components/layouts/icons/IconAdmin";
import { SidebarItem } from "./SidebarItem";
import { TFunction } from "i18next";
import IconDashboard from "@/components/layouts/icons/IconDashboard";
import IconSettings from "@/components/layouts/icons/IconSettings";

type Props = {
  t: TFunction;
  tenantId: string;
};

export const AppSidebar = ({ t, tenantId }: Props): SidebarItem[] => {
  const currentTenantUrl = `/app/${tenantId}`;

  const sectionItems: SidebarItem[] = [];

  const appItem: SidebarItem = {
    title: "",
    path: "",
    items: [
      {
        title: t("app.sidebar.dashboard"),
        path: `${currentTenantUrl}/dashboard`,
        icon: <IconDashboard className="h-5 w-5" />,
      },
    ],
  };

  return [
    appItem,
    ...sectionItems,
    {
      title: "",
      path: "",
      items: [
        {
          title: t("app.sidebar.settings"),
          path: `${currentTenantUrl}/settings`,
          redirectTo: `${currentTenantUrl}/settings/profile`,
          icon: <IconSettings className="h-5 w-5" />,
        },
        {
          title: t("admin.switchToAdmin"),
          path: "/admin/dashboard",
          adminOnly: true,
          icon: <IconAdmin className="h-5 w-5" />,
        },
      ],
    },
  ];
};
