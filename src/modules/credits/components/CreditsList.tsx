"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FilterablePropertyDto } from "@/lib/dtos/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import InputFilters from "@/components/ui/input/InputFilters";
import InputSearchWithURL from "@/components/ui/input/InputSearchWithURL";
import { FilterableValueLink } from "@/components/ui/links/FilterableValueLink";
import TableSimple from "@/components/ui/tables/TableSimple";
import DateUtils from "@/lib/utils/DateUtils";
import { CreditWithDetailsDto } from "@/db/models";

interface Props {
  data: {
    items: CreditWithDetailsDto[];
    filterableProperties: FilterablePropertyDto[];
    pagination: PaginationDto;
  };
}
export default function CreditsList({ data }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <div className="flex w-full items-center space-x-2">
        <div className="flex-grow">
          <InputSearchWithURL />
        </div>
        <InputFilters filters={data.filterableProperties} />
      </div>
      <TableSimple
        items={data.items}
        pagination={data.pagination}
        headers={[
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => <div className="text-xs text-gray-600">{item.createdAt && <span>{DateUtils.dateYMDHMS(item.createdAt)}</span>}</div>,
          },
          {
            name: "type",
            title: t("shared.type"),
            value: (item) => <div>{item.type}</div>,
          },
          {
            name: "resource",
            title: t("models.credit.resource"),
            className: "w-full",
            value: (item) => (
              <div className="max-w-xs truncate">
                {item.objectId ? (
                  <Link href={item.objectId} className="truncate underline">
                    {item.objectId}
                  </Link>
                ) : (
                  <span className="truncate">{t("shared.undefined")}</span>
                )}
              </div>
            ),
          },
          {
            name: "user",
            title: t("models.user.object"),
            value: (item) => <FilterableValueLink name="userId" value={item.user?.email} param={item.userId ?? "null"} />,
          },
        ]}
      />
    </div>
  );
}
