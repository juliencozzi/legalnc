import { NextResponse } from "next/server";

export async function GET() {
  // TODO: return tenders from DB (respect RLS by using supabase client with user)
  const demo = [
    { id: "demo-1", ref: "DAEM-APC-15-25", buyer: "Province Sud", title: "Balayage routes", deadlineAt: "2025-08-18" },
    { id: "demo-2", ref: "DTEFP-XX-25", buyer: "Gouvernement NC", title: "Portail Emploi", deadlineAt: "2025-09-05" },
  ];
  return NextResponse.json({ items: demo });
}
