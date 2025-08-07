"use client";

import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import useAppData from "@/lib/state/useAppData";
import useRootData from "@/lib/state/useRootData";

export default function () {
  const rootData = useRootData();
  const appData = useAppData();
  return (
    <IndexPageLayout title="Dev" className="pb-20">
      <div className="space-y-2">
        <ShowPayloadModalButton title="Root Data" description="Root Data" payload={JSON.stringify(rootData, null, 2)} />
        <ShowPayloadModalButton title="App Data" description="App Data" payload={JSON.stringify(appData, null, 2)} />
        <div className="prose">
          <h3>User Session</h3>
          <pre>{JSON.stringify({ userSession: rootData.userSession }, null, 2)}</pre>
        </div>
        <div className="prose">
          <h3>Permissions</h3>
          <pre>
            {JSON.stringify(
              {
                isSuperAdmin: appData.isSuperAdmin,
                isSuperUser: appData.isSuperUser,
                permissions: appData.permissions,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </IndexPageLayout>
  );
}
