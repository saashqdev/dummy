import clsx from "clsx";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Fragment } from "react";
import { StatDto } from "@/lib/services/adminDashboardService";

interface Props {
  items: StatDto[];
}

export function DashboardStats({ items }: Props) {
  return (
    <div>
      <div
        className={clsx(
          "grid grid-cols-2 gap-4 overflow-hidden rounded-lg sm:grid-cols-3",
          items.length === 1 && "md:grid-cols-1",
          items.length === 2 && "md:grid-cols-2",
          items.length === 3 && "md:grid-cols-3",
          items.length === 4 && "md:grid-cols-4",
          items.length === 5 && "md:grid-cols-4 lg:grid-cols-5",
          items.length === 6 && "md:grid-cols-4 lg:grid-cols-6"
        )}
      >
        {items.map((item, idx) => (
          <Fragment key={idx}>
            {item.href ? (
              <Link href={item.href} className="flex justify-between space-x-1 truncate rounded-lg border border-gray-200 bg-white p-5 hover:bg-gray-50">
                <DashboardStat item={item} />
              </Link>
            ) : (
              <DashboardStat className="flex justify-between space-x-1 truncate rounded-lg border border-gray-200 bg-white p-5" item={item} />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function DashboardStat({ item, className }: { item: StatDto; className?: string }) {
  const { t } = useTranslation();
  return (
    <div key={item.name} className={className}>
      <div className="truncate">
        <div className="flex items-baseline space-x-2 text-sm text-gray-500">
          <div>{t(item.name)}</div>
          {item.hint && <div className="hidden text-xs text-gray-400 xl:block">({t(item.hint)})</div>}
        </div>

        <div className="flex items-baseline space-x-2 text-2xl font-medium text-gray-900">
          <div>{item.stat}</div>
          {item.previousStat !== undefined && (
            <span className="ml-2 hidden text-sm font-medium text-gray-500 xl:block">{<span>from {item.previousStat}</span>}</span>
          )}
        </div>
      </div>
    </div>
  );
}
