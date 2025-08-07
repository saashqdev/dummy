"use client";

import HeaderBlock from "@/modules/pageBlocks/blocks/marketing/header/HeaderBlock";
import HeadingBlock from "@/modules/pageBlocks/blocks/marketing/heading/HeadingBlock";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { actionMarketingForms } from "./page";
import JsonPropertyValuesInput from "@/modules/jsonProperties/components/JsonPropertyValuesInput";
import JsonPropertiesUtils from "@/modules/jsonProperties/utils/JsonPropertiesUtils";
import { Button } from "@/components/ui/button";
import FooterBlock from "@/modules/pageBlocks/blocks/marketing/footer/FooterBlock";

export default function () {
  const [actionData, action, pending] = useActionState(actionMarketingForms, null);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  return (
    <div>
      <HeaderBlock />
      <div className="py-4">
        <HeadingBlock
          item={{
            headline: "Sample Form",
            subheadline: "This is a sample form with all supported properties.",
          }}
        />
      </div>
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <form action={action} method="post">
          <div className="space-y-2">
            <JsonPropertyValuesInput properties={JsonPropertiesUtils.allProperties} attributes={null} />
          </div>
          <div className="mt-2 flex justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
      <FooterBlock />
    </div>
  );
}
