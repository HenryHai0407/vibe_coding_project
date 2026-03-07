import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ tags: [] });
}

export async function POST() {
  return NextResponse.json({ success: false }, { status: 501 });
}
