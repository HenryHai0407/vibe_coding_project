import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createItemSchema } from "@/server/schemas/item.schema";
import { buildReviewCardsForItem } from "@/server/services/review-card-generator.service";

const listQuerySchema = z.object({
  query: z.string().optional(),
  type: z.enum(["word", "phrase", "grammar", "note"]).optional(),
  tagId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  dueOnly: z.enum(["true", "false"]).optional(),
  archived: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["newest", "oldest"]).default("newest")
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsed = listQuerySchema.safeParse({
    query: url.searchParams.get("query") ?? undefined,
    type: url.searchParams.get("type") ?? undefined,
    tagId: url.searchParams.get("tagId") ?? undefined,
    dateFrom: url.searchParams.get("dateFrom") ?? undefined,
    dateTo: url.searchParams.get("dateTo") ?? undefined,
    dueOnly: url.searchParams.get("dueOnly") ?? undefined,
    archived: url.searchParams.get("archived") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid query params." }, { status: 400 });
  }

  const { query, type, tagId, dateFrom, dateTo, dueOnly, archived, page, pageSize, sort } = parsed.data;

  const where: Prisma.LearningItemWhereInput = {
    userId: session.user.id,
    ...(archived === "true" ? {} : { archivedAt: null }),
    ...(type ? { type } : {}),
    ...(query
      ? {
          OR: [
            { finnishText: { contains: query, mode: "insensitive" } },
            { baseTranslation: { contains: query, mode: "insensitive" } },
            { explanation: { contains: query, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(tagId
      ? {
          itemTags: {
            some: {
              tagId
            }
          }
        }
      : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {})
          }
        }
      : {}),
    ...(dueOnly === "true"
      ? {
          reviewCards: {
            some: {
              suspended: false,
              nextReviewAt: { lte: new Date() }
            }
          }
        }
      : {})
  };

  const [total, items] = await Promise.all([
    db.learningItem.count({ where }),
    db.learningItem.findMany({
      where,
      orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        examples: {
          orderBy: { position: "asc" }
        },
        itemTags: {
          include: {
            tag: true
          }
        },
        reviewCards: {
          where: { suspended: false },
          orderBy: { nextReviewAt: "asc" },
          select: { nextReviewAt: true }
        }
      }
    })
  ]);

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      tags: item.itemTags.map((entry) => ({ id: entry.tag.id, name: entry.tag.name, color: entry.tag.color })),
      nextReviewAt: item.reviewCards[0]?.nextReviewAt ?? null
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    }
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid item payload." }, { status: 400 });
  }

  const ownedTags = await db.tag.findMany({
    where: {
      userId: session.user.id,
      id: {
        in: parsed.data.tagIds
      }
    },
    select: { id: true }
  });

  const reviewCards = buildReviewCardsForItem({
    type: parsed.data.type,
    finnishText: parsed.data.finnishText,
    baseTranslation: parsed.data.baseTranslation,
    explanation: parsed.data.explanation,
    examples: parsed.data.examples
  });

  const item = await db.learningItem.create({
    data: {
      userId: session.user.id,
      type: parsed.data.type,
      finnishText: parsed.data.finnishText.trim(),
      baseTranslation: parsed.data.baseTranslation?.trim() || null,
      explanation: parsed.data.explanation?.trim() || null,
      usageNote: parsed.data.usageNote?.trim() || null,
      sourceContext: parsed.data.sourceContext?.trim() || null,
      difficulty: parsed.data.difficulty,
      examples: {
        create: parsed.data.examples.map((example, index) => ({
          finnishSentence: example.finnishSentence.trim(),
          englishTranslation: example.englishTranslation?.trim() || null,
          note: example.note?.trim() || null,
          position: index
        }))
      },
      itemTags: {
        createMany: {
          data: ownedTags.map((tag) => ({ tagId: tag.id })),
          skipDuplicates: true
        }
      },
      reviewCards: {
        create: reviewCards
      }
    },
    select: {
      id: true,
      type: true,
      finnishText: true,
      createdAt: true
    }
  });

  return NextResponse.json({ item }, { status: 201 });
}
