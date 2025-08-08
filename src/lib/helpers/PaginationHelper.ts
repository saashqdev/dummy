import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants";

export function getCurrentPagination(searchParams?: { [key: string]: string | string[] | undefined }): { page: number; pageSize: number; query: string } {
  return {
    page: getCurrentPage(searchParams),
    pageSize: getCurrentPageSize(searchParams),
    query: searchParams?.q?.toString() ?? "",
  };
}

function getCurrentPage(searchParams?: { [key: string]: string | string[] | undefined }): number {
  let page = 1;
  const paramsPage = searchParams?.page;
  if (paramsPage) {
    page = Number(paramsPage);
  }
  if (page <= 0) {
    page = 1;
  }
  return page;
}

function getCurrentPageSize(searchParams?: { [key: string]: string | string[] | undefined }): number {
  let pageSize = DEFAULT_PAGE_SIZE;
  const paramsPageSize = searchParams?.pageSize;
  if (paramsPageSize) {
    pageSize = Number(paramsPageSize);
  }
  if (pageSize > MAX_PAGE_SIZE) {
    pageSize = MAX_PAGE_SIZE;
  }
  return pageSize;
}

export function getStringFilter(searchParams: { [key: string]: string | string[] | undefined } | undefined, name: string): string | undefined {
  const value = searchParams ? searchParams[name] : undefined;
  return value?.toString() ?? undefined;
}

export function getNullableStringFilter(searchParams: { [key: string]: string | string[] | undefined } | undefined, name: string): string | undefined | null {
  const value = searchParams ? searchParams[name] : undefined;
  if (value === "{null}") {
    return null;
  }
  return value?.toString() ?? undefined;
}

export function getBooleanFilter(searchParams: { [key: string]: string | string[] | undefined } | undefined, name: string): boolean | undefined {
  const value = searchParams ? searchParams[name] : undefined;
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return undefined;
}
