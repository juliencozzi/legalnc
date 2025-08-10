import { NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/epaync";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orgId, planCode } = body as { orgId: string; planCode: string };
    if (!orgId || !planCode) {
      return NextResponse.json({ error: "Missing orgId or planCode" }, { status: 400 });
    }
    const intent = await createPaymentIntent({ orgId, planCode });
    return NextResponse.json({ url: intent.checkoutUrl });
  } catch (e: any) {
    console.error("checkout error", e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
