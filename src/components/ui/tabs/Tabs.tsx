import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import UrlUtils from "@/lib/utils/UrlUtils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export interface TabItem {
  name: any;
  routePath?: string;
}

interface Props {
  className?: string;
  tabs: TabItem[];
  asLinks?: boolean;
  onSelected?: (idx: number) => void;
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
  selectedTab?: number;
}

export default function Tabs({ className = "", breakpoint = "md", tabs = [], asLinks = true, onSelected, selectedTab = 0 }: Props) {
  const { t } = useTranslation();

  const pathname = usePathname();
  const search = useSearchParams();
  const searchParams = new URLSearchParams(search.toString());
  const router = useRouter();

  const [selected, setSelected] = useState(selectedTab);

  useEffect(() => {
    tabs.forEach((tab, index) => {
      if (tab.routePath && (pathname + searchParams).includes(tab.routePath)) {
        setSelected(index);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, pathname]);

  function selectTab(idx: number) {
    const tab = tabs[idx];
    setSelected(idx);
    if (asLinks) {
      if (tab?.routePath) {
        router.push(tab.routePath);
      }
    } else {
      if (onSelected) {
        onSelected(idx);
      }
    }
  }
  function isCurrent(idx: number) {
    return currentTab() === tabs[idx];
  }
  const currentTab = () => {
    if (asLinks) {
      if (true) {
        return tabs.find((element) => element.routePath && UrlUtils.stripTrailingSlash(pathname) === UrlUtils.stripTrailingSlash(element.routePath));
      } else {
        return tabs.find((element) => element.routePath && (pathname + searchParams).includes(element.routePath));
      }
    } else {
      return tabs[selected];
    }
  };
  return (
    <div className={className}>
      <div
        className={clsx(
          breakpoint === "sm" && "sm:hidden",
          breakpoint === "md" && "md:hidden",
          breakpoint === "lg" && "lg:hidden",
          breakpoint === "xl" && "xl:hidden",
          breakpoint === "2xl" && "2xl:hidden"
        )}
      >
        <label htmlFor="tabs" className="sr-only">
          {t("app.shared.tabs.select")}
        </label>
        <select
          id="tabs"
          name="tabs"
          className="focus:border-accent-500 focus:ring-accent-500 block w-full rounded-md border-gray-300"
          onChange={(e) => selectTab(Number(e.currentTarget.value))}
          value={selected}
        >
          {tabs.map((tab, idx) => {
            return (
              <option key={tab.name} value={Number(idx)}>
                {tab.name}
              </option>
            );
          })}
        </select>
      </div>
      <div
        className={clsx(
          breakpoint === "sm" && "hidden sm:block",
          breakpoint === "md" && "hidden md:block",
          breakpoint === "lg" && "hidden lg:block",
          breakpoint === "xl" && "hidden xl:block",
          breakpoint === "2xl" && "hidden 2xl:block"
        )}
      >
        {(() => {
          if (asLinks) {
            return (
              <nav className="flex space-x-4" aria-label="Tabs">
                {tabs
                  .filter((f) => f.routePath)
                  .map((tab, idx) => {
                    return (
                      <Link
                        key={tab.name}
                        href={tab.routePath ?? ""}
                        className={clsx(
                          "truncate",
                          isCurrent(idx) ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                          "rounded-sm px-3 py-2 text-sm font-medium"
                        )}
                      >
                        {tab.name}
                      </Link>
                    );
                  })}
              </nav>
            );
          } else {
            return (
              <nav className="flex space-x-4" aria-label="Tabs">
                {tabs.map((tab, idx) => {
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => selectTab(idx)}
                      className={clsx(
                        "truncate",
                        isCurrent(idx) ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        "rounded-sm px-3 py-2 text-sm font-medium"
                      )}
                    >
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            );
          }
        })()}
      </div>
    </div>
  );
}
