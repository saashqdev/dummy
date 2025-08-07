import currencies from "@/modules/subscriptions/data/currencies";
import { db } from "@/db";
import NumberUtils from "@/lib/utils/NumberUtils";
import { getMrr } from "@/modules/subscriptions/services/SubscriptionService";
import { promiseHash } from "@/lib/utils";

export type StatDto = {
  name: string;
  hint: string;
  stat: string;
  href?: string;
  previousStat?: string;
};

export async function getAdminDashboardStats({ gte }: { gte: Date | undefined | undefined }): Promise<StatDto[]> {
  const { tenantStat, mrrStat, activeUsersStat } = await promiseHash({
    tenantStat: getTenantStat(gte),
    mrrStat: getMMRStat(),
    activeUsersStat: getActiveUsersStat(gte),
  });
  return [tenantStat, mrrStat, activeUsersStat];
}

async function getTenantStat(gte: Date | undefined) {
  const { added, total } = await getTenantsCreatedSince(gte);
  const tenantStat: StatDto = {
    name: "Accounts",
    hint: "Total accounts",
    stat: total.toString(),
    previousStat: (total - added).toString(),
    href: "/admin/accounts",
  };
  return tenantStat;
}

async function getMMRStat() {
  const defaultCurrency = currencies.find((f) => f.default);
  const currency = defaultCurrency ?? { value: "usd", symbol: "$" };
  const mrr = await getMrr(currency.value);
  const tenantStat: StatDto = {
    name: "MRR",
    hint: "Monthly recurring revenue in " + currency.value.toUpperCase(),
    stat: currency.symbol + NumberUtils.decimalFormat(mrr.total),
    previousStat: NumberUtils.intFormat(mrr.count) + " accounts",
  };
  return tenantStat;
}

async function getActiveUsersStat(gte: Date | undefined) {
  const { added, total } = await getLogsCreatedSince(gte);
  const activeUsersStat: StatDto = {
    name: "MAU",
    hint: "Monthly active users",
    stat: total.toString(),
    previousStat: (total - added).toString(),
  };
  return activeUsersStat;
}

async function getLogsCreatedSince(gte: Date | undefined) {
  // TODO: Implement MAU - Monthly active users
  const added = 0;
  const total = 0;

  return {
    added,
    total,
  };
}

async function getTenantsCreatedSince(gte: Date | undefined) {
  const added = await db.tenant.countCreatedSince(gte);
  const total = await db.tenant.count();

  return {
    added,
    total,
  };
}
