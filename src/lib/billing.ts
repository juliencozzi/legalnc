import { prisma } from "@/lib/db";

export async function updateSubscriptionFromWebhook(event: any) {
  // Map event to subscription/payment updates
  // TODO: adapt to real ePayNC webhook format
  const { type, data } = event;
  if (type === "payment.succeeded") {
    const orgId = data.metadata?.orgId as string | undefined;
    if (orgId) {
      await prisma.payment.create({
        data: {
          orgId,
          amountXpf: data.amount_xpf ?? 0,
          status: "paid",
          epayncPaymentId: data.id ?? null,
          meta: data,
        } as any,
      });
    }
  }
}
