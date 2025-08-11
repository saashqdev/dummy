"use client";

import { Fragment, useActionState, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import { actionAdminCache } from "./actions";
import TableSimple from "@/components/ui/tables/TableSimple";
import { CacheLoaderData } from "./page";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CachedValue } from "@/lib/services/cache.server";
import NumberUtils from "@/lib/utils/NumberUtils";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import DateCell from "@/components/ui/dates/DateCell";
import RefreshIcon from "@/components/ui/icons/RefreshIcon";
import InputSearch from "@/components/ui/input/InputSearch";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import { defaultAppConfiguration } from "@/modules/core/data/defaultAppConfiguration";

export default function ({ data }: { data: CacheLoaderData }) {
  const { t } = useTranslation();
  const [actionData, action, pending] = useActionState(actionAdminCache, null);

  const search = useSearchParams();
  const searchParams = new URLSearchParams(search);
  const pathname = usePathname();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
    router.refresh();
  }, [actionData]);

  const filteredItems = () => {
    let items = data.cachedValues;
    if (!searchInput.trim()) {
      return items;
    }
    return items.filter(
      (item) =>
        item.key.toLowerCase().includes(searchInput.toLowerCase()) ||
        JSON.stringify(item.value ?? "")
          ?.toLowerCase()
          .includes(searchInput.toLowerCase())
    );
  };

  const sortedItems = () => {
    const items = filteredItems();
    const sortBy = searchParams.get("sort") ?? "-createdTime";
    const sortAsc = sortBy.startsWith("-");
    const sortKey = sortBy.replace("-", "");
    const sorted = items.sort((a, b) => {
      if (sortKey === "key") {
        return sortAsc ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key);
      } else if (sortKey === "sizeMb") {
        return sortAsc ? a.sizeMb - b.sizeMb : b.sizeMb - a.sizeMb;
      } else if (sortKey === "createdTime") {
        return sortAsc ? a.createdTime - b.createdTime : b.createdTime - a.createdTime;
      }
      return 0;
    });
    return sorted;
  };

  function onDeleteAll() {
    const form = new FormData();
    form.set("action", "delete-all");
    action(form);
  }
  function onDelete(key: string) {
    const form = new FormData();
    form.set("action", "delete-key");
    form.set("key", key);
    action(form);
  }
  function onDeleteSelected(keys: string[]) {
    const form = new FormData();
    form.set("action", "delete-keys");
    form.set("keys", keys.join(","));
    action(form);
  }

  function getValue(item: CachedValue) {
    try {
      // if is array, count
      if (Array.isArray(item.value)) {
        return item.value.length + " items";
      } else if (typeof item.value === "object") {
        return Object.keys(item.value).length + " keys";
      }
    } catch {}
    return item.value;
  }
  return (
    <IndexPageLayout
      title={`Cache: ${NumberUtils.intFormat(data.cachedValues.length)} keys, ${NumberUtils.decimalFormat(
        data.cachedValues.reduce((a, b) => a + b.sizeMb, 0),
        2
      )} MB`}
    >
      <div className="space-y-3">
        <div className="flex justify-between space-x-2">
          <InputSearch className="w-full flex-grow" value={searchInput} onChange={setSearchInput} />
          <DeleteButton items={sortedItems()} searchInput={searchInput} onDeleteAll={onDeleteAll} onDeleteSelected={onDeleteSelected} />
          <ButtonSecondary to={pathname + searchParams} isLoading={pending}>
            <RefreshIcon className="h-4 w-4" />
          </ButtonSecondary>
        </div>

        <div className="flex-grow space-y-2 overflow-auto p-1">
          {!defaultAppConfiguration.app.cache ? (
            <WarningBanner title={t("shared.warning")}>
              Cache is disabled. Enable it on the file: <code>src/modules/core/data/defaultAppConfiguration.ts</code>
            </WarningBanner>
          ) : (
            <TableSimple
              items={sortedItems()}
              noRecords={
                <div className="flex flex-col space-y-1 py-4 text-sm">
                  <div>{t("shared.noRecords")}</div>
                  {searchInput && (
                    <div>
                      <button type="button" className="text-blue-500 underline" onClick={() => setSearchInput("")}>
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              }
              headers={[
                {
                  name: "key",
                  title: "Key",
                  value: (item) => <div className="max-w-xs truncate">{item.key}</div>,
                  sortBy: "key",
                  sortable: true,
                },
                {
                  name: "type",
                  title: "Type",
                  value: (item) => (Array.isArray(item.value) ? "array" : typeof item.value),
                },
                {
                  name: "value",
                  title: "Value",
                  value: (item) => (
                    <div className="flex justify-start">
                      <ShowPayloadModalButton className="max-w-sm truncate" description={getValue(item)} payload={item.value} />
                    </div>
                  ),
                },
                {
                  name: "size",
                  title: "Size",
                  value: (item) => <div>{NumberUtils.decimalFormat(item.sizeMb, 4)} MB</div>,
                  sortBy: "sizeMb",
                },
                {
                  name: "createdAt",
                  title: "Created at",
                  // value: (item) => item.createdAt,
                  value: (item) => <DateCell date={item.createdAt} displays={["ymdhmsms"]} />,
                  sortBy: "createdTime",
                },
              ]}
              actions={[
                {
                  title: "Delete",
                  onClick: (_, item) => onDelete(item.key),
                  disabled: (item) => pending,
                  destructive: true,
                },
              ]}
            />
          )}
        </div>
      </div>
    </IndexPageLayout>
  );
}

function DeleteButton({
  items,
  searchInput,
  onDeleteAll,
  onDeleteSelected,
}: {
  items: CachedValue[];
  searchInput: string;
  onDeleteAll: () => void;
  onDeleteSelected: (keys: string[]) => void;
}) {
  return (
    <Fragment>
      {searchInput ? (
        <ButtonSecondary
          className="w-full"
          disabled={items.length === 0}
          onClick={() => onDeleteSelected(items.map((f) => f.key))}
          // isLoading={navigation.formData?.get("action") === "delete-selected"}
        >
          Clear {items.length} keys
        </ButtonSecondary>
      ) : (
        <ButtonSecondary
          disabled={items.length === 0}
          className="w-full"
          onClick={() => onDeleteAll()}
          // isLoading={navigation.formData?.get("action") === "delete-all"}
        >
          Clear {items.length} keys
        </ButtonSecondary>
      )}
    </Fragment>
  );
}
