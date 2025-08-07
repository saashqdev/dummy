import IconApp from "@/components/layouts/icons/IconApp";
import { SidebarItem } from "./SidebarItem";
import { TFunction } from "i18next";
import IconDashboard from "@/components/layouts/icons/IconDashboard";
import IconSettings from "@/components/layouts/icons/IconSettings";
import MembershipCardIcon from "@/components/ui/icons/MembershipCardIcon";

export const AdminSidebar = (t: TFunction): SidebarItem[] => [
  {
    title: t(""),
    path: "",
    items: [
      {
        title: t("app.sidebar.dashboard"),
        path: `/admin/dashboard`,
        icon: <IconDashboard className="h-5 w-5" />,
      },
      {
        title: t("app.sidebar.accountsAndUsers"),
        path: "/admin/accounts",
        isCollapsible: false,
        icon: <MembershipCardIcon className="h-5 w-5" />,
      },
    ],
  },
  {
    title: t(""),
    path: "",
    items: [
      {
        title: t("app.sidebar.settings"),
        path: `/admin/settings`,
        isCollapsible: false,
        icon: <IconSettings className="h-5 w-5" />,
      },
      {
        title: t("admin.switchToApp"),
        path: "/app",
        exact: true,
        icon: <IconApp className="h-5 w-5" />,
      },
    ],
  },
];
