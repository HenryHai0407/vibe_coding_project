import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { dueReviewQuerySchema } from "@/server/schemas/review.schema";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsed = dueReviewQuerySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid query params." }, { status: 400 });
  }

  const now = new Date();
  const cards = await db.reviewCard.findMany({
    where: {
      suspended: false,
      nextReviewAt: { lte: now },
      learningItem: {
        userId: session.user.id,
        archivedAt: null
      }
    },
    orderBy: [{ nextReviewAt: "asc" }, { createdAt: "asc" }],
    take: parsed.data.limit,
    include: {
      learningItem: {
        select: {
          id: true,
          type: true,
          finnishText: true,
          baseTranslation: true
        }
      }
    }
  });

  return NextResponse.json({ cards, dueCount: cards.length });
}
