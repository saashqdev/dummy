import { Resend } from "resend";

export async function sendEmailResend(
  data: { to: string; subject: string; body: string },
  config: {
    apiKey: string;
    from: string;
  }
) {
  const resend = new Resend(config.apiKey);
  const sent = await resend.emails.send({
    from: config.from,
    to: [data.to],
    subject: data.subject,
    html: data.body,
  });

  return sent;
}
