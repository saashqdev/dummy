"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FilterableValueLink({ name, value, param, children }: { name: string; value: string | undefined; param?: string; children?: React.ReactNode }) {
  const search = useSearchParams();
  const searchParams = new URLSearchParams(search);
  const router = useRouter();
  const pathname = usePathname();
  function isFiltered() {
    if (param) {
      return searchParams.get(name) === param;
    }
    return searchParams.get(name) === value;
  }
  return (
    <div>
      {!isFiltered() ? (
        <button
          type="button"
          onClick={() => {
            searchParams.set(name, param ?? value ?? "");
            searchParams.delete("page");
            // setSearchParams(searchParams);
            router.replace(`${pathname}?${searchParams.toString()}`);
          }}
          className="hover:text-blue-700 hover:underline"
        >
          {children ?? value}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            searchParams.delete(name);
            searchParams.delete("page");
            // setSearchParams(searchParams);
            router.replace(`${pathname}?${searchParams.toString()}`);
          }}
          className="underline hover:text-gray-500 hover:line-through"
        >
          {children ?? value}
        </button>
      )}
    </div>
  );
}
