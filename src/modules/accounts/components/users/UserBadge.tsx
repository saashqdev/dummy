"use client";

import { useTranslation } from "react-i18next";
import UserAvatarBadge from "./UserAvatarBadge";
import { Fragment } from "react";
import Link from "next/link";
import { AdminRoleEnum } from "@/modules/permissions/enums/AdminRoleEnum";

interface Props {
  item: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  admin?: boolean | null;
  withEmail?: boolean;
  withAvatar?: boolean;
  withSignUpMethod?: boolean;
  showCurrent?: boolean;
  href?: string;
  roles?: {
    role: {
      name: string;
      description: string;
    };
  }[];
}
export default function UserBadge(props: Props) {
  return (
    <Fragment>
      <Item {...props} />
    </Fragment>
  );
}

function Item({ item, admin, withEmail = true, withAvatar, showCurrent, href, roles }: Props) {
  const { t } = useTranslation();
  function isAdmin() {
    if (admin) {
      return true;
    }
    let isAdmin = false;
    roles?.forEach((role) => {
      if ([AdminRoleEnum.SuperAdmin].map((f) => f.toString()).includes(role.role.name)) {
        isAdmin = true;
      }
    });
    return isAdmin;
  }
  return (
    <Fragment>
      {!withAvatar ? (
        <div className="group">
          {href ? (
            <Link href={href} className="group-hover:underline">
              <span>
                {item.firstName} {item.lastName} {withEmail && <span className="text-xs font-normal italic opacity-80">({item.email})</span>}
              </span>
            </Link>
          ) : (
            <span>
              {item.firstName} {item.lastName} {withEmail && <span className="text-xs font-normal italic opacity-80">({item.email})</span>}
            </span>
          )}
        </div>
      ) : (
        <div className="group flex items-center">
          <UserAvatarBadge avatar={item.avatar} />
          <div className="ml-3 truncate">
            <div className="truncate font-medium">
              {href ? (
                <Link href={href} className="group-hover:underline">
                  <span className="truncate">
                    {item.firstName} {item.lastName} {isAdmin() && <span className="text-xs text-teal-500">({t("shared.adminAccess")})</span>}{" "}
                  </span>
                </Link>
              ) : (
                <span className="truncate">
                  {item.firstName} {item.lastName} {isAdmin() && <span className="text-xs text-teal-500">({t("shared.adminAccess")})</span>}{" "}
                </span>
              )}
              {showCurrent && <span className="text-xs font-normal italic opacity-80">({t("shared.you")})</span>}
            </div>
            <div className="flex items-center space-x-1 truncate opacity-80">
              <div className="truncate">{item.email}</div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}
