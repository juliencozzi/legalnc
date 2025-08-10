import { NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/epaync";
import { updateSubscriptionFromWebhook } from "@/lib/billing";

export const runtime = "nodejs"; // ensure Node crypto availability

export async function POST(req: Request) {
  const signature = req.headers.get("x-epaync-signature") || "";
  const rawBody = await req.text();

  try {
    const event = verifyWebhook(rawBody, signature);
    await updateSubscriptionFromWebhook(event);
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    console.error("Webhook error:", e?.message || e);
    return NextResponse.json({ error: "Invalid signature or processing error" }, { status: 400 });
  }
}
