"use client";

import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import { CachedValue } from "@/lib/services/cache.server";
import HeaderBlock from "@/modules/pageBlocks/blocks/marketing/header/HeaderBlock";
import HeadingBlock from "@/modules/pageBlocks/blocks/marketing/heading/HeadingBlock";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { actionDev } from "./page";
import useRootData from "@/lib/state/useRootData";

export default function DevComponent({
  data,
}: {
  data: {
    cachedValues: CachedValue[];
    databaseState: {
      alreadySeeded: boolean;
      users: number;
      tenants: number;
    };
  };
}) {
  const rootData = useRootData();
  const [actionData, action, pending] = useActionState(actionDev, null);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  function onClick(actionType: string) {
    const form = new FormData();
    form.append("action", actionType);
    action(form);
  }

  return (
    <div>
      <HeaderBlock />
      <HeadingBlock
        item={{
          style: "centered",
          headline: "Development Mode",
          subheadline: "This page is only available in development",
        }}
      />
      <div className="container mx-auto max-w-3xl space-y-6 bg-background py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-wrap justify-center gap-4">
            <ShowPayloadModalButton
              title="Root Data"
              variant="secondary"
              description={<div>📁 View root data</div>}
              payload={JSON.stringify(rootData, null, 2)}
              size="3xl"
            />
            <ShowPayloadModalButton
              title="Cached Values"
              variant="secondary"
              description={<div>🗄️ View cache ({data.cachedValues.length})</div>}
              payload={JSON.stringify(
                {
                  keys: data.cachedValues.map((cv) => cv.key),
                  cachedValues: data.cachedValues,
                },
                null,
                2
              )}
              size="3xl"
              withCopy={false}
              buttons={
                <>
                  <ButtonSecondary onClick={() => onClick("clearCache")} isLoading={pending}>
                    Clear all
                  </ButtonSecondary>
                </>
              }
            />
            <ShowPayloadModalButton
              title="Database State"
              variant="secondary"
              description={<div>{data.databaseState.alreadySeeded ? <span>🌱 Already seeded</span> : <span>🌱 Seed database</span>}</div>}
              payload={JSON.stringify(data.databaseState, null, 2)}
              size="3xl"
              withCopy={false}
              buttons={
                <>
                  <ButtonSecondary onClick={() => onClick("seed")} isLoading={pending}>
                    Seed
                  </ButtonSecondary>
                </>
              }
            />
            {/* <ButtonSecondary disabled={rootData.user ? false : true} onClick={() => onClick("logout")}>
              Logout
            </ButtonSecondary>
            <ButtonSecondary disabled={rootData.user ? true : false} onClick={() => onClick("login")}>
              Login
            </ButtonSecondary> */}
          </div>
        </div>
      </div>
    </div>
  );
}
