import { ReactNode } from "react";
import { DefaultPermission } from "../../modules/permissions/data/DefaultPermission";

export interface SidebarItem {
  title: string;
  path: string;
  icon?: ReactNode;
  description?: string;
  open?: boolean;
  adminOnly?: boolean;
  items?: SidebarItem[];
  side?: ReactNode;
  exact?: boolean;
  featureFlag?: string;
  redirectTo?: string;
  isCollapsible?: boolean;
  target?: "_blank" | undefined;
  disabled?: boolean;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}
