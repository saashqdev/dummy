import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type PromiseHash = Record<string, Promise<unknown>>;
type AwaitedPromiseHash<Hash extends PromiseHash> = {
  [Key in keyof Hash]: Awaited<Hash[Key]>;
};
export async function promiseHash<Hash extends PromiseHash>(hash: Hash): Promise<AwaitedPromiseHash<Hash>> {
  return Object.fromEntries(await Promise.all(Object.entries(hash).map(async ([key, promise]) => [key, await promise])));
}
