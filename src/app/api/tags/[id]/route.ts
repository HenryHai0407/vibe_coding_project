import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json({ success: false }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ success: false }, { status: 501 });
}
