import { defaultAppConfiguration } from "@/modules/core/data/defaultAppConfiguration";
import { sendEmailPostmark } from "./PostmarkEmailService";
import { sendEmailResend } from "./ResendEmailService";

export async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
  // data?: { to: string; };
}) {
  const clientConfig = getEmailConfig({ throwError: true });
  if (!clientConfig) {
    // eslint-disable-next-line no-console
    throw new Error("📧 Email provider not configured");
    // console.error("📧 Email provider not configured");
    return;
  }
  // eslint-disable-next-line no-console
  console.log("📧 Sending email", { providerSettings: clientConfig.provider, to, subject });
  switch (clientConfig.provider) {
    case "postmark":
      return await sendEmailPostmark({ to, subject, body }, clientConfig);
    case "resend":
      return await sendEmailResend({ to, subject, body }, clientConfig);
    default:
      throw new Error("Invalid provider: " + clientConfig.provider);
  }
}

export function getEmailProvider() {
  const clientConfig = getEmailConfig();
  return clientConfig?.provider;
}

export function getEmailConfig({ throwError = false } = {}) {
  if (defaultAppConfiguration.email.provider === "postmark") {
    if (!process.env.POSTMARK_SERVER_TOKEN) {
      // eslint-disable-next-line no-console
      console.error("📧 POSTMARK_SERVER_TOKEN required");
      if (throwError) {
        throw new Error("POSTMARK_SERVER_TOKEN required");
      }
      return null;
    }
    return {
      provider: "postmark",
      apiKey: process.env.POSTMARK_SERVER_TOKEN,
      from: defaultAppConfiguration.email.fromEmail,
    };
  } else if (defaultAppConfiguration.email.provider === "resend") {
    if (!process.env.RESEND_API_KEY) {
      // eslint-disable-next-line no-console
      console.error("📧 RESEND_API_KEY required");
      if (throwError) {
        throw new Error("RESEND_API_KEY required");
      }
      return null;
    }
    return {
      provider: "resend",
      apiKey: process.env.RESEND_API_KEY,
      from: defaultAppConfiguration.email.fromEmail,
    };
  }
  console.error("📧 POSTMARK_SERVER_TOKEN or RESEND_API_KEY required");
  return null;
}
