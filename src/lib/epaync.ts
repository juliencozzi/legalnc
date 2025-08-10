import crypto from "node:crypto";

type CreatePaymentArgs = { orgId: string; planCode: string };
export async function createPaymentIntent({ orgId, planCode }: CreatePaymentArgs) {
  // Placeholder: adapt to ePayNC API (create payment intent & return hosted checkout URL)
  const base = process.env.EPAYNC_API_BASE || "https://api.epay.nc";
  const apiKey = process.env.EPAYNC_API_KEY || "";
  const returnUrl = process.env.BILLING_RETURN_URL || "";
  const cancelUrl = process.env.BILLING_CANCEL_URL || "";

  // Example payload — adjust to real API contract
  const payload = {
    amount_xpf: 1000,
    currency: "XPF",
    description: `Subscription ${planCode} for org ${orgId}`,
    metadata: { orgId, planCode },
    return_url: returnUrl,
    cancel_url: cancelUrl,
  };

  // NOTE: This is a stub. Replace with a real fetch to ePayNC.
  // const res = await fetch(`${base}/v1/checkout`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
  //   body: JSON.stringify(payload),
  // });
  // const data = await res.json();

  const data = { checkout_url: `${returnUrl}?demo=1` };
  return { checkoutUrl: data.checkout_url };
}

export function verifyWebhook(rawBody: string, signature: string) {
  const secret = process.env.EPAYNC_WEBHOOK_SECRET || "";
  if (!secret) throw new Error("Missing EPAYNC_WEBHOOK_SECRET");
  // Generic HMAC-SHA256 example. Adjust to the real signature scheme from ePayNC.
  const computed = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  if (computed !== signature) {
    throw new Error("Invalid webhook signature");
  }
  const event = JSON.parse(rawBody);
  return event;
}
