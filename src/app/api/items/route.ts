import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ items: [], pagination: { page: 1, pageSize: 20, total: 0 } });
}

export async function POST() {
  return NextResponse.json({ message: "create item endpoint scaffolded" }, { status: 501 });
}
