import { Fragment, useState } from "react";
import { SidebarItem, SidebarGroup } from "./SidebarItem";
import { AdminSidebar } from "./AdminSidebar";
import { AppSidebar } from "./AppSidebar";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import UrlUtils from "@/lib/utils/UrlUtils";
import useRootData from "@/lib/state/useRootData";
import TenantSelector from "./selectors/TenantSelector";
import { AppDataDto } from "@/lib/state/useAppData";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";

interface Props {
  layout: "app" | "admin";
  onSelected?: () => void;
  appData?: AppDataDto;
}

export default function SidebarMenu({ layout, onSelected, appData }: Props) {
  const params = useParams();
  const { t } = useTranslation();
  const pathname = usePathname();
  const rootData = useRootData();
  const menu = layout === "admin" ? AdminSidebar(t) : AppSidebar({ t, tenantId: params.tenant?.toString() ?? "" });

  const getMenuItems = () => {
    function clearItemsIfNotCollapsible(items: SidebarItem[]) {
      items.forEach((item) => {
        if (item.isCollapsible !== undefined && !item.isCollapsible) {
          item.items = [];
        }
        if (item.items) {
          clearItemsIfNotCollapsible(item.items);
        }
      });
    }
    clearItemsIfNotCollapsible(menu);

    menu.forEach((item) => {
      if (item.isCollapsible !== undefined && !item.isCollapsible) {
        item.items = [];
      }
      item.items?.forEach((subitem) => {
        if (subitem.isCollapsible !== undefined && !subitem.isCollapsible) {
          subitem.items = [];
        }
      });
    });

    return menu;
  };

  const [expanded, setExpanded] = useState<string[]>([]);

  function menuItemIsExpanded(path: string) {
    return expanded.includes(path);
  }
  function toggleMenuItem(path: string) {
    if (expanded.includes(path)) {
      setExpanded(expanded.filter((item) => item !== path));
    } else {
      setExpanded([...expanded, path]);
    }
  }
  function getPath(item: SidebarItem) {
    return item.path.replace(":tenant", params.tenant?.toString() ?? "");
  }
  function isCurrent(menuItem: SidebarItem) {
    if (menuItem.path) {
      if (menuItem.exact) {
        return pathname === getPath(menuItem);
      }
      return pathname?.includes(getPath(menuItem));
    }
  }
  function currentIsChild(menuItem: SidebarItem) {
    let hasOpenChild = false;
    menuItem.items?.forEach((item) => {
      if (isCurrent(item)) {
        hasOpenChild = true;
      }
    });
    return hasOpenChild;
  }
  function allowCurrentUserType(item: SidebarItem) {
    if (item.adminOnly && !rootData?.user?.admin) {
      return false;
    }
    return true;
  }
  // function checkUserRolePermissions(item: SidebarItem) {
  //   return !item.permission || appOrAdminData?.permissions?.includes(item.permission) || adminData?.permissions?.includes(item.permission);
  // }
  const getMenu = (): SidebarGroup[] => {
    function filterItem(f: SidebarItem) {
      return allowCurrentUserType(f); // && checkUserRolePermissions(f);
    }
    const _menu: SidebarGroup[] = [];
    getMenuItems()
      .filter((f) => filterItem(f))
      .forEach(({ title, items }) => {
        _menu.push({
          title: title.toString(),
          items:
            items
              ?.filter((f) => filterItem(f))
              .map((f) => {
                return {
                  ...f,
                  items: f.items?.filter((f) => filterItem(f)),
                };
              }) ?? [],
        });
      });
    return _menu.filter((f) => f.items.length > 0);
  };

  function cssStates() {
    return {
      selected: clsx(
        ["zinc", "slate", "stone", "gray", "neutral"].includes(rootData.theme.color)
          ? "bg-slate-700 text-slate-50"
          : "bg-primary/90 focus:bg-primary/80 text-primary-foreground"
      ),
    };
  }
  return (
    <div>
      {layout === "app" && <div>{appData && <TenantSelector key={params.tenant?.toString()} appData={appData} />}</div>}

      {/* Mobile */}
      <div className="space-y-1 divide-y-2 divide-slate-800 sm:hidden">
        {getMenu().map((group, index) => {
          return (
            <div key={index} className="mt-2">
              <div id={group.title} className="mt-2">
                <h3 className="px-1 text-xs font-semibold uppercase leading-4 tracking-wider text-slate-500">{t(group.title)}</h3>
              </div>
              {group.items.map((menuItem, index) => {
                return (
                  <div key={index}>
                    {(() => {
                      if (!menuItem.items || menuItem.items.length === 0) {
                        return (
                          <div>
                            {menuItem.path.includes("://") ? (
                              <a
                                target="_blank"
                                href={menuItem.path}
                                rel="noreferrer"
                                className={clsx(
                                  "group mt-1 flex items-center space-x-4 rounded-sm px-4 py-2 text-base leading-5 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-gray-50 focus:outline-none"
                                )}
                                onClick={onSelected}
                              >
                                {menuItem.icon !== undefined && menuItem.icon}
                                <div>{t(menuItem.title)}</div>
                              </a>
                            ) : (
                              <Link
                                id={UrlUtils.slugify(getPath(menuItem))}
                                href={menuItem.redirectTo ?? getPath(menuItem)}
                                className={clsx(
                                  "group mt-1 flex items-center space-x-4 rounded-sm px-4 py-2 text-base leading-5 transition duration-150 ease-in-out focus:outline-none",
                                  isCurrent(menuItem) && cssStates().selected,
                                  !isCurrent(menuItem) && "text-slate-200 hover:bg-slate-800 focus:bg-slate-800"
                                )}
                                onClick={onSelected}
                              >
                                {menuItem.icon !== undefined && menuItem.icon}
                                <div>{t(menuItem.title)}</div>
                              </Link>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <div
                              className="group mt-1 flex items-center justify-between rounded-sm px-4 py-2 text-base leading-5 text-slate-200 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-gray-50 focus:outline-none"
                              onClick={() => toggleMenuItem(menuItem.path)}
                            >
                              <div className="flex items-center space-x-4 truncate">
                                {menuItem.icon !== undefined && <span className="h-5 w-5 text-slate-200 transition ease-in-out">{menuItem.icon}</span>}
                                <div className="truncate">{t(menuItem.title)}</div>
                              </div>
                              {/*Expanded: "text-gray-400 rotate-90", Collapsed: "text-slate-200" */}
                              <svg
                                className={clsx(
                                  "ml-auto h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out",
                                  menuItemIsExpanded(menuItem.path)
                                    ? "ml-auto h-3 w-3 rotate-90 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400 group-focus:text-gray-400"
                                    : "ml-auto h-3 w-3 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400 group-focus:text-gray-400"
                                )}
                                viewBox="0 0 20 20"
                              >
                                <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                              </svg>
                            </div>
                            {/*Expandable link section, show/hide based on state. */}
                            {menuItemIsExpanded(menuItem.path) && (
                              <div className="mt-1">
                                {menuItem.items.map((subItem, index) => {
                                  return (
                                    <Fragment key={index}>
                                      {menuItem.path.includes("://") ? (
                                        <a
                                          target="_blank"
                                          href={menuItem.path}
                                          rel="noreferrer"
                                          className={clsx(
                                            "group mt-1 flex items-center rounded-sm py-2 pl-14 leading-5 text-slate-200 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-slate-300 focus:bg-slate-800 focus:text-slate-300 focus:outline-none sm:text-sm"
                                          )}
                                          onClick={onSelected}
                                        >
                                          {subItem.icon !== undefined && <span className="mr-1 h-5 w-5 transition ease-in-out">{subItem.icon}</span>}
                                          {t(subItem.title)}
                                        </a>
                                      ) : (
                                        <Link
                                          key={index}
                                          id={UrlUtils.slugify(getPath(subItem))}
                                          href={subItem.redirectTo ?? getPath(subItem)}
                                          className={clsx(
                                            "group mt-1 flex items-center rounded-sm py-2 pl-14 leading-5 transition duration-150 ease-in-out hover:text-slate-300 focus:text-slate-300 focus:outline-none sm:text-sm",
                                            isCurrent(subItem) && cssStates().selected,
                                            !isCurrent(subItem) && "text-slate-200 hover:bg-slate-800 focus:bg-slate-800"
                                          )}
                                          onClick={onSelected}
                                        >
                                          {subItem.icon !== undefined && <span className="mr-1 h-5 w-5 transition ease-in-out">{subItem.icon}</span>}
                                          {t(subItem.title)}
                                        </Link>
                                      )}{" "}
                                    </Fragment>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }
                    })()}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Desktop */}
      <div className="hidden space-y-1 divide-y-2 divide-slate-800 sm:block">
        {getMenu().map((group, index) => {
          return (
            <div key={index} className="select-none">
              <div className="mt-2">
                <h3 id="Group-headline" className="px-1 text-xs font-semibold uppercase leading-4 tracking-wider text-slate-500">
                  {t(group.title)}
                </h3>
              </div>
              {group.items.map((menuItem, index) => {
                return (
                  <div key={index}>
                    {(() => {
                      if (!menuItem.items || menuItem.items.length === 0) {
                        return (
                          <div>
                            {menuItem.path.includes("://") ? (
                              <a
                                target="_blank"
                                href={menuItem.path}
                                rel="noreferrer"
                                className={clsx(
                                  "group mt-1 flex items-center justify-between truncate rounded-sm px-4 py-2 text-sm leading-5 text-slate-200 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-gray-50 focus:outline-none",
                                  menuItem.icon !== undefined && "px-4"
                                )}
                                onClick={onSelected}
                              >
                                <div className="flex items-center space-x-5">
                                  {menuItem.icon !== undefined && menuItem.icon}
                                  <div>{t(menuItem.title)}</div>
                                </div>
                                {menuItem.side}
                              </a>
                            ) : (
                              <Link
                                id={UrlUtils.slugify(getPath(menuItem))}
                                href={menuItem.redirectTo ?? getPath(menuItem)}
                                className={clsx(
                                  "group mt-1 flex items-center justify-between truncate rounded-sm px-4 py-2 text-sm leading-5 transition duration-150 ease-in-out focus:outline-none",
                                  menuItem.icon !== undefined && "px-4",
                                  isCurrent(menuItem) && cssStates().selected,
                                  !isCurrent(menuItem) && "text-slate-200 hover:bg-slate-800 focus:bg-slate-800"
                                )}
                                onClick={onSelected}
                              >
                                <div className="flex items-center space-x-5">
                                  {menuItem.icon !== undefined && menuItem.icon}
                                  <div>{t(menuItem.title)}</div>
                                </div>
                                {menuItem.side}
                              </Link>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <button
                              type="button"
                              className="group mt-1 flex w-full items-center justify-between truncate rounded-sm px-4 py-2 text-sm leading-5 text-slate-200 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-gray-50 focus:outline-none"
                              onClick={() => toggleMenuItem(menuItem.path)}
                            >
                              <div className="flex items-center space-x-5 truncate">
                                {menuItem.icon !== undefined && menuItem.icon}
                                <div className="truncate">{t(menuItem.title)}</div>
                              </div>
                              {/*Expanded: "text-gray-400 rotate-90", Collapsed: "text-slate-200" */}

                              {menuItem.side ?? (
                                <svg
                                  className={clsx(
                                    "ml-auto h-5 w-5 flex-shrink-0 transform bg-slate-900 transition-colors duration-150 ease-in-out",
                                    menuItemIsExpanded(menuItem.path)
                                      ? "ml-auto h-3 w-3 rotate-90 transform transition-colors duration-150 ease-in-out"
                                      : "ml-auto h-3 w-3 transform transition-colors duration-150 ease-in-out"
                                  )}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                                </svg>
                              )}
                            </button>

                            {/*Expandable link section, show/hide based on state. */}
                            {menuItemIsExpanded(menuItem.path) && (
                              <div className="mt-1">
                                {menuItem.items.map((subItem, index) => {
                                  return (
                                    <Fragment key={index}>
                                      {menuItem.path.includes("://") ? (
                                        <a
                                          target="_blank"
                                          href={menuItem.path}
                                          rel="noreferrer"
                                          className={clsx(
                                            isCurrent(subItem) && cssStates().selected,
                                            "group mt-1 flex items-center rounded-sm py-2 text-sm leading-5 transition duration-150 ease-in-out focus:outline-none",
                                            menuItem.icon === undefined && "pl-10",
                                            menuItem.icon !== undefined && "pl-14"
                                          )}
                                          onClick={onSelected}
                                        >
                                          {subItem.icon !== undefined && subItem.icon}
                                          <div>{t(subItem.title)}</div>
                                        </a>
                                      ) : (
                                        <Link
                                          id={UrlUtils.slugify(getPath(subItem))}
                                          href={subItem.redirectTo ?? getPath(subItem)}
                                          className={clsx(
                                            "group mt-1 flex items-center rounded-sm py-2 text-sm leading-5 transition duration-150 ease-in-out focus:outline-none",
                                            menuItem.icon === undefined && "pl-10",
                                            menuItem.icon !== undefined && "pl-14",
                                            isCurrent(subItem) && cssStates().selected,
                                            !isCurrent(subItem) && "hover:bg-slate-800 focus:bg-slate-800"
                                          )}
                                          onClick={onSelected}
                                        >
                                          {subItem.icon !== undefined && subItem.icon}
                                          <div>{t(subItem.title)}</div>
                                        </Link>
                                      )}
                                    </Fragment>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }
                    })()}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
