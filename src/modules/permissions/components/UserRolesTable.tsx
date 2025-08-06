"use client";

import { useTranslation } from "react-i18next";
import EmptyState from "@/components/ui/emptyState/EmptyState";
import UserBadge from "../../accounts/components/users/UserBadge";
import clsx from "clsx";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import XIcon from "@/components/ui/icons/XIcon";
import Link from "next/link";
import { UserWithRolesDto, RoleWithPermissionsDto } from "@/db/models";

interface Props {
  items: UserWithRolesDto[];
  roles: RoleWithPermissionsDto[];
  onChange: (item: UserWithRolesDto, role: RoleWithPermissionsDto, add: any) => void;
  tenantId?: string | null;
  disabled?: boolean;
  onRoleClick?: (role: RoleWithPermissionsDto) => void;
  actions?: {
    onEditRoute?: (item: UserWithRolesDto) => string;
  };
}

export default function UserRolesTable({ items, roles, onChange, tenantId = null, disabled, onRoleClick, actions }: Props) {
  const { t } = useTranslation();

  return (
    <div>
      {(() => {
        if (items.length === 0) {
          return (
            <div>
              <EmptyState className="bg-white" description={t("app.users.empty")} />
            </div>
          );
        } else {
          return (
            <div>
              <div>
                <div className="flex flex-col">
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                      <div className="overflow-hidden border border-gray-200 shadow sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="w-64 select-none truncate px-1 py-1 pl-4 text-left text-xs font-medium tracking-wider text-gray-500">
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <div>{t("models.user.plural")}</div>
                                </div>
                              </th>

                              {roles.map((role, idx) => {
                                return (
                                  <th
                                    key={idx}
                                    scope="col"
                                    className="select-none truncate px-1 py-1 text-center text-xs font-medium tracking-wider text-gray-500"
                                  >
                                    <div className="flex items-center justify-center space-x-1 text-gray-500">
                                      {onRoleClick ? (
                                        <button type="button" onClick={() => onRoleClick(role)} className="hover:underline">
                                          {role.name}
                                        </button>
                                      ) : (
                                        <div>{role.name}</div>
                                      )}
                                    </div>
                                  </th>
                                );
                              })}

                              {actions && <td className="select-none truncate px-1 py-1 text-center text-xs font-medium tracking-wider text-gray-500"></td>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {items.map((item, idx) => {
                              return (
                                <tr key={idx}>
                                  <td className="whitespace-nowrap px-1 py-1 pl-4 text-sm text-gray-600">
                                    <UserBadge
                                      item={item}
                                      withAvatar={true}
                                      admin={item.admin}
                                      href={!actions?.onEditRoute ? undefined : actions.onEditRoute(item)}
                                      roles={item.roles}
                                    />
                                  </td>
                                  {roles.map((role) => {
                                    const existing = item.roles.find((f) => f.roleId === role.id && f.tenantId === tenantId) !== undefined;
                                    return (
                                      <td key={role.name} className="whitespace-nowrap px-1 py-1 text-center text-sm text-gray-600">
                                        <div className="flex justify-center">
                                          <button
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => onChange(item, role, !existing)}
                                            className={clsx(
                                              "flex h-6 w-6 items-center justify-center rounded-full",
                                              existing ? "bg-green-100 text-green-500" : "bg-gray-100 text-gray-500",
                                              !disabled && existing && "hover:bg-green-200 hover:text-green-600",
                                              !disabled && !existing && "hover:bg-gray-200 hover:text-gray-600"
                                            )}
                                          >
                                            {existing ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 text-gray-500" />}
                                          </button>
                                        </div>
                                      </td>
                                    );
                                  })}
                                  {/* {onEditRoute && (
                                    <td className="whitespace-nowrap px-1 py-1 text-center text-sm text-gray-600">
                                      <Link to={onEditRoute(item)} className="hover:underline">
                                        {t("shared.edit")}
                                      </Link>
                                    </td>
                                  )} */}
                                  {actions && (
                                    <td className="whitespace-nowrap px-1 py-1 text-center text-sm text-gray-600">
                                      <div className="flex items-center space-x-2">
                                        {actions.onEditRoute && (
                                          <Link href={actions?.onEditRoute(item)} className="text-gray-500 hover:underline">
                                            {t("shared.edit")}
                                          </Link>
                                        )}
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      })()}
    </div>
  );
}
