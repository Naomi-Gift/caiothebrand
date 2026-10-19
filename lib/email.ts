/**
 * Transactional email via Resend (https://resend.com), server-only.
 *   RESEND_API_KEY  API key
 *   EMAIL_FROM      e.g. "Caio Pizza <hello@caiopizza.com>" (domain verified in Resend)
 * Returns false (and sends nothing) until both are set.
 */
export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  if (!emailConfigured()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      console.error("[email] send failed", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send error", err);
    return false;
  }
}

/** The site's public address — never taken from the request (host-header safe). */
export function siteUrl() {
  return (process.env.SITE_URL || "https://www.caiopizza.com").replace(/\/+$/, "");
}

export function resetPasswordEmail(name: string | null, link: string) {
  const hi = name ? `Hi ${name.split(" ")[0]},` : "Hi,";
  const text = `${hi}\n\nSomeone (hopefully you) asked to reset the password for your Caio Pizza account.\n\nChoose a new password here (the link works once, for 1 hour):\n${link}\n\nIf it wasn't you, ignore this email — your password won't change.\n\nCaio for now.\nCaio Pizza`;
  const html = `<!doctype html><html><body style="margin:0;background:#f8f3e9;font-family:Georgia,'Times New Roman',serif;color:#1a0e08">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f3e9;padding:32px 16px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #ebe2cf;border-radius:20px;padding:32px">
      <tr><td style="font-size:26px;font-weight:bold;color:#3a2418">Caio <span style="color:#8b6f4f">Pizza</span></td></tr>
      <tr><td style="padding-top:24px;font-size:16px;line-height:1.6">${hi}<br><br>Someone (hopefully you) asked to reset the password for your Caio Pizza account.</td></tr>
      <tr><td style="padding:24px 0"><a href="${link}" style="display:inline-block;background:#3a2418;color:#f8f3e9;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;padding:14px 26px;border-radius:999px">Choose a new password</a></td></tr>
      <tr><td style="font-size:13px;line-height:1.6;color:#6b4f38">The link works once and expires in 1 hour. If it wasn't you, ignore this email — your password won't change.</td></tr>
      <tr><td style="padding-top:24px;font-size:14px;font-style:italic;color:#8b6f4f">Caio for now.</td></tr>
    </table>
  </td></tr></table></body></html>`;
  return { subject: "Reset your Caio Pizza password", html, text };
}
