const postmark = require("postmark");
// import postmark from "postmark";

export async function sendEmailPostmark(
  data: { to: string; subject: string; body: string },
  config: {
    from: string;
    apiKey: string;
  }
) {
  console.log("📧 Postmark", {
    providerSettings: "postmark",
    from: config.from,
    to: data.to,
    subject: data.subject,
    apiKey: config.apiKey,
  });
  const client = new postmark.ServerClient(config.apiKey);
  const sent = await client.sendEmail({
    From: config.from,
    To: data.to,
    Subject: data.subject,
    HtmlBody: data.body,
  });
  return sent;
}
