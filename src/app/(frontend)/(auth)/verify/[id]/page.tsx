"use server";

import { getServerTranslations } from "@/i18n/server";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { db } from "@/db";
import Component from "./component";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { UserRegistrationAttemptModel } from "@/db/models";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("account.verify.title")} | ${defaultSiteTags.title}`,
  });
}

type LoaderData = {
  registration: UserRegistrationAttemptModel | null;
};
export const loader = async (props: IServerComponentsProps): Promise<LoaderData> => {
  const params = await props.params;
  const registration = await db.userRegistrationAttempt.getByToken(params?.id ?? "");
  const data: LoaderData = {
    registration,
  };
  return data;
};

export default async function (props: IServerComponentsProps) {
  const data = await loader(props);
  return <Component data={data} />;
}
