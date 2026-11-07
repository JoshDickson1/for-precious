import { escapeHtml } from "./http.ts";
import { requireEnv } from "./supabase.ts";

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://forprecious.love";
const FROM = Deno.env.get("EMAIL_FROM") ?? "For Precious <notes@forprecious.love>";
const REPLY_TO = Deno.env.get("EMAIL_REPLY_TO");

export interface EmailContent {
  preview: string;
  eyebrow?: string;
  heading: string;
  paragraphs: string[];
  cta: { label: string; url: string };
  secondary?: { label: string; url: string };
  footer: string;
  unsubscribeUrl?: string;
}

function htmlContent(content: EmailContent): string {
  const paragraphs = content.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:#4A3942;">${escapeHtml(
          paragraph,
        )}</p>`,
    )
    .join("");

  const secondary = content.secondary
    ? `<p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
         <a href="${content.secondary.url}" style="color:#9C3560;text-decoration:underline;">${escapeHtml(
           content.secondary.label,
         )}</a>
       </p>`
    : "";

  const unsubscribe = content.unsubscribeUrl
    ? `<a href="${content.unsubscribeUrl}" style="color:#7C6672;text-decoration:underline;">Stop these emails</a>`
    : "";

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(
    content.heading,
  )}</title></head>
<body style="margin:0;padding:0;background:#FFF9FB;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(content.preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF9FB;padding:32px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #EFDCE5;border-radius:20px;overflow:hidden;">
          <tr>
            <td style="padding:26px 30px 18px;">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#2C1F26;letter-spacing:-0.01em;">For Precious</span>
            </td>
          </tr>
          <tr><td style="padding:0 30px;"><div style="height:1px;background:#EFDCE5;"></div></td></tr>
          <tr>
            <td style="padding:28px 30px 30px;">
              ${
                content.eyebrow
                  ? `<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#7C6672;">${escapeHtml(
                      content.eyebrow,
                    )}</p>`
                  : ""
              }
              <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:27px;line-height:1.25;font-weight:400;color:#2C1F26;">${escapeHtml(
                content.heading,
              )}</h1>
              ${paragraphs}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:26px;">
                <tr>
                  <td style="border-radius:999px;background:#9C3560;">
                    <a href="${content.cta.url}" style="display:inline-block;padding:14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:999px;">${escapeHtml(
                      content.cta.label,
                    )}</a>
                  </td>
                </tr>
              </table>
              ${secondary}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 30px;background:#FBEDF3;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#7C6672;">
                ${escapeHtml(content.footer)}<br>
                ${unsubscribe}
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.18em;color:#B9A4AE;">FORPRECIOUS.LOVE</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function plainContent(content: EmailContent): string {
  const lines = [
    "FOR PRECIOUS",
    "",
    content.eyebrow ? content.eyebrow.toUpperCase() : "",
    content.heading,
    "",
    ...content.paragraphs,
    "",
    `${content.cta.label}: ${content.cta.url}`,
    content.secondary ? `${content.secondary.label}: ${content.secondary.url}` : "",
    "",
    content.footer,
    content.unsubscribeUrl ? `Stop these emails: ${content.unsubscribeUrl}` : "",
    "",
    SITE_URL,
  ];
  return lines.filter((line) => line !== "").join("\n");
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  content: EmailContent;
  tags?: Record<string, string>;
}): Promise<{ id: string | null }> {
  const apiKey = requireEnv("RESEND_API_KEY");
  const body: Record<string, unknown> = {
    from: FROM,
    to: [input.to],
    subject: input.subject,
    html: htmlContent(input.content),
    text: plainContent(input.content),
  };
  if (REPLY_TO) body.reply_to = REPLY_TO;
  if (input.content.unsubscribeUrl) {
    body.headers = {
      "List-Unsubscribe": `<${input.content.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend rejected the email (${response.status}): ${detail.slice(0, 300)}`);
  }

  const result = (await response.json()) as { id?: string };
  return { id: result.id ?? null };
}
