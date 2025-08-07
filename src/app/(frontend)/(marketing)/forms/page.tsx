"use server";

import JsonPropertiesUtils from "@/modules/jsonProperties/utils/JsonPropertiesUtils";
import Component from "./component";

export const actionMarketingForms = async (prev: any, form: FormData) => {
  const attributes = JsonPropertiesUtils.getValuesFromForm({
    properties: JsonPropertiesUtils.allProperties,
    form,
  });
  return { success: JSON.stringify(attributes, null, 2) };
};

export default async function DevRoute() {
  return <Component />;
}
