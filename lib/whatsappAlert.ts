/**
 * Automatic "new order" alert to the branch over the WhatsApp Business
 * Cloud API (Meta). Does nothing until these are set in Vercel:
 *
 *   WHATSAPP_TOKEN            permanent access token (System User)
 *   WHATSAPP_PHONE_NUMBER_ID  the sending business number's ID
 *   WHATSAPP_ALERT_TO         who gets alerts, e.g. 2348137550148
 *                             (comma-separate several; WHATSAPP_ALERT_TO_LAGOS
 *                             etc. overrides it for one branch)
 *   WHATSAPP_TEMPLATE         approved template name with ONE body variable
 *                             ({{1}} = the order summary). Without it a plain
 *                             text message is sent, which WhatsApp only
 *                             delivers if that number messaged the business
 *                             number in the last 24 hours — fine for testing.
 *   WHATSAPP_TEMPLATE_LANG    template language code (default "en")
 */
import { orderSummaryLines, type OrderSummaryInput } from "@/lib/orderMessage";

export async function sendOrderAlert(branchId: string, order: OrderSummaryInput): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const toRaw = process.env[`WHATSAPP_ALERT_TO_${branchId.toUpperCase()}`] ?? process.env.WHATSAPP_ALERT_TO;
  if (!token || !phoneId || !toRaw) return; // not set up yet

  const summary = [`New order ${order.id} — Caio ${order.branchName}`, ...(order.customerName ? [`Customer: ${order.customerName}`] : []), ...orderSummaryLines(order)];
  const template = process.env.WHATSAPP_TEMPLATE;
  // Template variables can't contain line breaks.
  const message = template
    ? {
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
          components: [{ type: "body", parameters: [{ type: "text", text: summary.join(" · ").slice(0, 1000) }] }],
        },
      }
    : { type: "text", text: { body: summary.join("\n") } };

  const recipients = toRaw.split(",").map((n) => n.replace(/\D/g, "")).filter(Boolean);
  await Promise.all(
    recipients.map(async (to) => {
      try {
        const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ messaging_product: "whatsapp", to, ...message }),
        });
        if (!res.ok) console.error("[whatsapp] alert failed", res.status, (await res.text()).slice(0, 300));
      } catch (err) {
        console.error("[whatsapp] alert error", err);
      }
    })
  );
}
