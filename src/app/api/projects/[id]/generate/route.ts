import { NextResponse } from "next/server";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  // TODO: call LLM to generate trames, store files in Storage
  return NextResponse.json({ ok: true, projectId: params.id, files: [] });
}
