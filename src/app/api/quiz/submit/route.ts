import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ score: { correct: 0, incorrect: 0, total: 0 }, results: [] }, { status: 501 });
}
