import { NextResponse } from "next/server";
import { initSignature } from "@/lib/signatureNc";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  // TODO: send document to Signature.nc
  const res = await initSignature({ projectId: params.id });
  return NextResponse.json(res);
}
