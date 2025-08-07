"use client";

import clsx from "clsx";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import ButtonTertiary from "../buttons/ButtonTertiary";
import TablePagination from "./TablePagination";
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import DownArrow from "../icons/DownArrow";
import UpArrow from "../icons/UpArrow";
import ConfirmModal, { RefConfirmModal } from "../modals/ConfirmModal";
import { Checkbox } from "../checkbox";
import { TFunction } from "i18next";
import InputSelect from "../input/InputSelect";
import { Input } from "../input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props<T> {
  headers: RowHeaderDisplayDto<T>[];
  items: T[];
  actions?: RowHeaderActionDto<T>[];
  pagination?: PaginationDto;
  onClickRoute?: (idx: number, item: T) => string | undefined;
  selectedRows?: T[];
  onSelected?: (item: T[]) => void;
  className?: (idx: number, item: T) => string;
  padding?: string;
  noRecords?: ReactNode;
  emptyState?: { title: string; description: string; icon?: ReactNode };
  darkMode?: boolean;
}

export default function TableSimple<T>(props: Props<T>) {
  const [showChild, setShowChild] = useState(false);

  // Wait until after client-side hydration to show
  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    // You can show some kind of placeholder UI here
    return null;
  }

  return <Table {...props} />;
}

function Table<T>({
  headers,
  items,
  actions = [],
  pagination,
  onClickRoute,
  selectedRows,
  onSelected,
  className,
  padding = "px-2 py-2",
  noRecords,
  emptyState,
  darkMode,
}: Props<T>) {
  const { t } = useTranslation();
  const router = useRouter();
  const search = useSearchParams();
  const pathname = usePathname();

  const [sortBy, setSortBy] = useState<{ by: string; order: "asc" | "desc" }[]>();

  useEffect(() => {
    const searchParams = new URLSearchParams(search.toString());
    let sort = searchParams.get("sort");
    const sortArray = sort?.split(",") ?? [];
    const sortObject = sortArray.map((s) => {
      let order: "asc" | "desc" = "asc";
      if (s.startsWith("-")) {
        order = "desc";
      }
      return { by: s.replace("-", ""), order };
    });
    setSortBy(sortObject);
  }, [search]);
  // const [selectedRows, setSelectedRows] = useState<T[]>([]);

  // useEffect(() => {
  //   if (onSelected) {
  //     onSelected(selectedRows);
  //   }
  // }, [selectedRows]);

  function toggleSelected(_: number, item: T) {
    if (!selectedRows || !onSelected) {
      return;
    }
    if (selectedRows.includes(item)) {
      onSelected(selectedRows.filter((i) => i !== item));
    } else {
      onSelected([...selectedRows, item]);
    }
  }

  const checkbox = useRef(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);

  useLayoutEffect(() => {
    if (!selectedRows || !onSelected) {
      return;
    }
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < items.length;
    setChecked(selectedRows.length === items.length && items.length > 0);
    setIndeterminate(isIndeterminate);
    // @ts-ignore
    checkbox.current.indeterminate = isIndeterminate;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSelected, selectedRows]);

  function toggleAll() {
    if (!selectedRows || !onSelected) {
      return;
    }
    onSelected(checked || indeterminate ? [] : items);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  function onHeaderClick(header: RowHeaderDisplayDto<T>) {
    const searchParams = new URLSearchParams(search.toString());
    if (!header.sortBy) {
      return;
    }
    let currentSort = sortBy?.find((s) => s.by === header.sortBy);
    let newSort = header.sortBy;
    if (currentSort?.order === "asc") {
      newSort = `-${header.sortBy}`;
    }
    searchParams.set("sort", newSort);
    // setSearchParams(searchParams);
    router.replace(`${pathname}?${searchParams.toString()}`);
  }

  function getSortDirection(header: RowHeaderDisplayDto<T>) {
    if (!header.sortBy) {
      return;
    }
    let currentSort = sortBy?.find((s) => s.by === header.sortBy);
    if (!currentSort) {
      return;
    }
    return currentSort.order;
  }

  return (
    <div className={clsx("shadow-xs w-full overflow-hidden rounded-lg border border-border", darkMode && "")}>
      <div className="w-full overflow-x-auto bg-background">
        <table className="whitespace-no-wrap w-full">
          <thead className={clsx("", darkMode && "")}>
            <tr className={clsx("border-b border-border text-left text-xs font-semibold tracking-wide text-muted-foreground", darkMode && "")}>
              {actions.filter((f) => f.firstColumn).length > 0 && <th scope="col" className="px-2 py-1"></th>}
              {onSelected && (
                <th scope="col" className="relative w-10 px-6 py-5 sm:w-12 sm:px-6">
                  <Checkbox
                    title="Select all"
                    ref={checkbox}
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-border text-primary-foreground focus:ring-ring sm:left-6"
                    checked={checked}
                    onCheckedChange={toggleAll}
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
              )}
              {headers
                .filter((f) => !f.hidden)
                .map((header, idxHeader) => {
                  return (
                    <th
                      key={idxHeader}
                      scope="col"
                      onClick={() => onHeaderClick(header)}
                      className={clsx(
                        idxHeader === 0 && actions.filter((f) => f.firstColumn).length === 0 && "pl-3",
                        "whitespace-nowrap px-2 py-2 tracking-wider",
                        header.breakpoint === "sm" && "hidden sm:table-cell",
                        header.breakpoint === "md" && "mg:table-cell hidden",
                        header.breakpoint === "lg" && "hidden lg:table-cell",
                        header.breakpoint === "xl" && "hidden xl:table-cell",
                        header.breakpoint === "2xl" && "hidden 2xl:table-cell",
                        header.sortBy && "cursor-pointer"
                      )}
                    >
                      <div
                        className={clsx(
                          "group flex space-x-2",
                          !header.align && "justify-between",
                          header.align === "right" && "justify-end",
                          header.align === "center" && "justify-center",
                          header.align === "left" && "justify-start"
                        )}
                      >
                        <div className={clsx(header.className, "select-none truncate")}>{t(header.title)}</div>
                        {header.sortBy && (
                          <div className="text text-muted-foreground group-hover:text-foreground">
                            {getSortDirection(header) === "desc" ? (
                              <DownArrow className="h-4 w-4" />
                            ) : (
                              getSortDirection(header) === "asc" && <UpArrow className="h-4 w-4" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              {actions.filter((f) => !f.firstColumn).length > 0 && <th scope="col" className="px-2 py-1"></th>}
            </tr>
          </thead>
          <tbody className={clsx("divide-divide divide-y", darkMode && "")}>
            {items.length === 0 ? (
              <tr className={clsx("", darkMode && "")}>
                <td colSpan={headers.filter((f) => !f.hidden).length + actions.length + (onSelected ? 1 : 0)} className="text-center">
                  {noRecords ?? (
                    <div className="p-3 text-sm text-muted-foreground">
                      {!emptyState ? (
                        <span>{t("shared.noRecords")}</span>
                      ) : (
                        <div className="space-y-1">
                          <div className="font-medium">{emptyState.title}</div>
                          <div>{emptyState.description}</div>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              items.map((item, idxRow) => {
                const href = onClickRoute?.(idxRow, item);
                return (
                  <tr
                    key={idxRow}
                    onClick={
                      href
                        ? (e) => {
                            if (e.ctrlKey || e.metaKey) {
                              window.open(href, "_blank");
                            } else {
                              router.push(href);
                            }
                          }
                        : undefined
                    }
                    className={clsx("group", href && "cursor-pointer hover:bg-secondary", darkMode && "")}
                  >
                    <ActionsCells actions={actions.filter((f) => f.firstColumn)} className={className} item={item} idxRow={idxRow} />
                    {onSelected && (
                      <td className={clsx("relative w-10 px-6 sm:w-12 sm:px-6", darkMode && "")}>
                        {selectedRows?.includes(item) && <div className="absolute inset-y-0 left-0 w-0.5 bg-primary" />}
                        <div className="flex items-center space-x-1">
                          <Checkbox
                            title="Select"
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-border text-primary-foreground focus:ring-ring sm:left-6"
                            checked={selectedRows?.includes(item)}
                            onCheckedChange={(e) => {
                              toggleSelected(idxRow, item);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </td>
                    )}
                    {headers
                      .filter((f) => !f.hidden)
                      .map((header, idxHeader) => {
                        return (
                          <td
                            key={idxHeader}
                            className={clsx(
                              idxHeader === 0 && actions.filter((f) => f.firstColumn).length === 0 && "pl-4",
                              "whitespace-nowrap text-sm",
                              darkMode && "",
                              header.className,
                              padding ?? "px-2 py-2",
                              header.breakpoint === "sm" && "hidden sm:table-cell",
                              header.breakpoint === "md" && "mg:table-cell hidden",
                              header.breakpoint === "lg" && "hidden lg:table-cell",
                              header.breakpoint === "xl" && "hidden xl:table-cell",
                              header.breakpoint === "2xl" && "hidden 2xl:table-cell",
                              className && className(idxRow, item)
                            )}
                          >
                            {displayRowValue(t, header, item, idxRow)}
                          </td>
                        );
                      })}
                    <ActionsCells actions={actions.filter((f) => !f.firstColumn)} className={className} item={item} idxRow={idxRow} />
                  </tr>
                );
              })
            )}

            {/* {[...Array(pageSize - items.length)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={headers.length + 1} className="whitespace-nowrap text-sm text-gray-600">
                      <div className="px-2 py-2.5 invisible">No row</div>
                    </td>
                  </tr>
                ))} */}
          </tbody>
        </table>
      </div>
      {pagination && (
        <TablePagination totalItems={pagination.totalItems} totalPages={pagination.totalPages} page={pagination.page} pageSize={pagination.pageSize} />
      )}
    </div>
  );
}

function ActionsCells<T>({
  item,
  actions,
  idxRow,
  className,
}: {
  item: T;
  actions: RowHeaderActionDto<T>[];
  idxRow: number;
  className?: (idx: number, item: T) => string;
}) {
  const { t } = useTranslation();
  const refConfirm = useRef<RefConfirmModal>(null);
  function onConfirmed({ action, item }: { action: RowHeaderActionDto<T>; item: T }) {
    if (action.onClick) {
      action.onClick(idxRow, item);
    }
  }
  return (
    <>
      {actions && actions.length > 0 && (
        <td className={clsx("whitespace-nowrap px-2 py-1", className && className(idxRow, item))}>
          <div className="flex space-x-2">
            {actions
              .filter((f) => !f.hidden || !f.hidden(item))
              .map((action, idx) => {
                return (
                  <ButtonTertiary
                    disabled={action.disabled !== undefined ? action.disabled(item) : action.disabled}
                    key={idx}
                    destructive={action.renderIsDestructive !== undefined ? action.renderIsDestructive(item) : action.destructive}
                    // prefetch={action.prefetch}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (action.onClick) {
                        if (action.confirmation) {
                          const confirmation = action.confirmation(item);
                          refConfirm.current?.setDestructive(action.destructive || false);
                          refConfirm.current?.setValue({
                            action: action,
                            item: item,
                          });
                          refConfirm.current?.show(confirmation.title, t("shared.confirm"), t("shared.cancel"), confirmation.description);
                        } else {
                          action.onClick(idxRow, item);
                        }
                      }
                    }}
                    to={action.onClickRoute && action.onClickRoute(idxRow, item)}
                    target={action.onClickRouteTarget}
                  >
                    {action.renderTitle ? action.renderTitle(item) : action.title}
                  </ButtonTertiary>
                );
              })}
          </div>
        </td>
      )}
      <ConfirmModal ref={refConfirm} onYes={onConfirmed} />
    </>
  );
}

export type RowHeaderDisplayDto<T> = {
  title: string;
  name?: string;
  type?: "text" | "number" | "select" | "decimal";
  value: (item: T, idx: number) => any;
  href?: (item: T) => string | undefined;
  options?: { name: string; value: number | string; disabled?: boolean }[];
  onChange?: (value: string | number, idx: number) => void;
  editable?: (item: T, idx?: number) => boolean;
  className?: string;
  sortable?: boolean;
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
  inputNumberStep?: string;
  inputOptional?: boolean;
  sortBy?: string;
  align?: "left" | "center" | "right";
  hidden?: boolean;
};

export interface RowHeaderActionDto<T> {
  title?: string | ReactNode;
  onClick?: (idx: number, item: T) => void;
  onClickRoute?: (idx: number, item: T) => string | undefined;
  onClickRouteTarget?: undefined | "_blank";
  disabled?: (item: T) => boolean | boolean;
  hidden?: (item: T) => boolean;
  destructive?: boolean;
  firstColumn?: boolean;
  renderTitle?: (item: T) => ReactNode;
  renderIsDestructive?: (item: T) => boolean;
  // prefetch?: "intent" | "render" | "none";
  confirmation?: (item: T) => {
    title: string;
    description: string;
  };
}

function displayRowValue<T>(t: TFunction, header: RowHeaderDisplayDto<T>, item: T, idxRow: number) {
  return (
    <>
      {!header.onChange ? (
        <>
          {header.href !== undefined && header.href(item) ? (
            <Link
              onClick={(e) => {
                e.stopPropagation();
              }}
              href={header.href(item) ?? ""}
              className="rounded-md border-b border-dashed border-transparent hover:border-gray-400 focus:bg-gray-100"
            >
              <span>{header.value(item, idxRow)}</span>
            </Link>
          ) : (
            <span>{header.value(item, idxRow)}</span>
          )}
        </>
      ) : (
        <>
          {header.type === undefined || header.type === "text" ? (
            <Input
              name={header.name}
              title={t(header.title)}
              value={header.value(item, idxRow)}
              disabled={header.editable && !header.editable(item, idxRow)}
              onChange={(e) => {
                if (header.onChange) {
                  header.onChange(e.currentTarget.value, idxRow);
                }
              }}
              required={!header.inputOptional}
            />
          ) : header.type === "number" ? (
            <Input
              type="number"
              name={header.name}
              title={t(header.title)}
              value={header.value(item, idxRow)}
              disabled={header.editable && !header.editable(item)}
              onChange={(e) => {
                if (header.onChange) {
                  header.onChange(Number(e.currentTarget.value), idxRow);
                }
              }}
              required={!header.inputOptional}
              step={header.inputNumberStep}
            />
          ) : header.type === "select" ? (
            <InputSelect
              name={header.name}
              value={header.value(item, idxRow)}
              onChange={(e) => {
                if (header.onChange) {
                  header.onChange(Number(e), idxRow);
                }
              }}
              options={header.options ?? []}
              required={!header.inputOptional}
              disabled={header.editable && !header.editable(item)}
            />
          ) : (
            <></>
          )}
        </>
      )}
    </>
  );
}
