import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // TODO: persist onboarding profile (sectors, keywords, budgets, alert preferences)
  const body = await req.json();
  return NextResponse.json({ ok: true, profile: body });
}
