import HeaderBlock from "@/modules/pageBlocks/blocks/marketing/header/HeaderBlock";
import { useTranslation } from "react-i18next";
import FooterBlock from "@/modules/pageBlocks/blocks/marketing/footer/FooterBlock";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("front.terms.title")} | ${defaultSiteTags.title}`,
  });
}

export default async function () {
  const { t } = await getServerTranslations();

  return (
    <div>
      <div>
        <HeaderBlock />
        <div className="min-h-screen py-6">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="sm:align-center space-y-4 sm:flex sm:flex-col">
              <div className="prose mx-auto text-muted-foreground dark:prose-dark">
                <h1 className="flex justify-center text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t("front.terms.title")}</h1>

                <h3>Introduction</h3>

                <p>
                  These Website Standard Terms and Conditions written on this webpage shall manage your use of our website, RockStack accessible at
                  rockstack.dev.
                </p>

                <p>
                  These Terms will be applied fully and affect to your use of this Website. By using this Website, you agreed to accept all terms and conditions
                  written in here. You must not use this Website if you disagree with any of these Website Standard Terms and Conditions. These Terms and
                  Conditions have been generated with the help of the{" "}
                  <a href="https://www.termsandcondiitionssample.com">Terms And Conditiions Sample Generator</a>.
                </p>

                <p>Minors or people below 18 years old are not allowed to use this Website.</p>

                <h3>Intellectual Property Rights</h3>

                <p>
                  Other than the content you own, under these Terms, RockStack and/or its licensors own all the intellectual property rights and materials
                  contained in this Website.
                </p>

                <p>You are granted limited license only for purposes of viewing the material contained on this Website.</p>

                <h3>Restrictions</h3>

                <p>You are specifically restricted from all of the following:</p>

                <ul>
                  <li>publishing any Website material in any other media;</li>
                  <li>selling, sublicensing and/or otherwise commercializing any Website material;</li>
                  <li>publicly performing and/or showing any Website material;</li>
                  <li>using this Website in any way that is or may be damaging to this Website;</li>
                  <li>using this Website in any way that impacts user access to this Website;</li>
                  <li>
                    using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business
                    entity;
                  </li>
                  <li>engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this Website;</li>
                  <li>using this Website to engage in any advertising or marketing.</li>
                </ul>

                <p>
                  Certain areas of this Website are restricted from being access by you and RockStack may further restrict access by you to any areas of this
                  Website, at any time, in absolute discretion. Any user ID and password you may have for this Website are confidential and you must maintain
                  confidentiality as well.
                </p>

                <h3>Your Content</h3>

                <p>
                  In these Website Standard Terms and Conditions, &quot;Your Content&quot; shall mean any audio, video text, images or other material you choose
                  to display on this Website. By displaying Your Content, you grant RockStack a non-exclusive, worldwide irrevocable, sub licensable license to
                  use, reproduce, adapt, publish, translate and distribute it in any and all media.
                </p>

                <p>
                  Your Content must be your own and must not be invading any third-party’s rights. RockStack reserves the right to remove any of Your Content
                  from this Website at any time without notice.
                </p>

                <h3>Your Privacy</h3>

                <p>Please read Privacy Policy.</p>

                <h3>No warranties</h3>

                <p>
                  This Website is provided &quot;as is,&quot; with all faults, and RockStack express no representations or warranties, of any kind related to
                  this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.
                </p>

                <h3>Limitation of liability</h3>

                <p>
                  In no event shall RockStack, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way
                  connected with your use of this Website whether such liability is under contract. RockStack, including its officers, directors and employees
                  shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this
                  Website.
                </p>

                <h3>Indemnification</h3>

                <p>
                  You hereby indemnify to the fullest extent RockStack from and against any and/or all liabilities, costs, demands, causes of action, damages
                  and expenses arising in any way related to your breach of any of the provisions of these Terms.
                </p>

                <h3>Severability</h3>

                <p>
                  If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the
                  remaining provisions herein.
                </p>

                <h3>Variation of Terms</h3>

                <p>
                  RockStack is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a
                  regular basis.
                </p>

                <h3>Assignment</h3>

                <p>
                  The RockStack is allowed to assign, transfer, and subcontract its rights and/or obligations under these Terms without any notification.
                  However, you are not allowed to assign, transfer, or subcontract any of your rights and/or obligations under these Terms.
                </p>

                <h3>Entire Agreement</h3>

                <p>
                  These Terms constitute the entire agreement between RockStack and you in relation to your use of this Website, and supersede all prior
                  agreements and understandings.
                </p>

                <h3>Governing Law & Jurisdiction</h3>

                <p>
                  These Terms will be governed by and interpreted in accordance with the laws of the State of us, and you submit to the non-exclusive
                  jurisdiction of the state and federal courts located in us for the resolution of any disputes.
                </p>
              </div>
            </div>
          </div>
        </div>
        <FooterBlock />
      </div>
    </div>
  );
}
