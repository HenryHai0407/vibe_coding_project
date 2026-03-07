import Link from "next/link";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type ItemsSearchParams = {
  query?: string;
  type?: "word" | "phrase" | "grammar" | "note";
  tagId?: string;
  archived?: "true" | "false";
  dueOnly?: "true" | "false";
  sort?: "newest" | "oldest";
  page?: string;
  pageSize?: string;
  dateFrom?: string;
  dateTo?: string;
};

function buildQueryString(base: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(base).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

export default async function ItemsPage({ searchParams }: { searchParams?: ItemsSearchParams }) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const query = searchParams?.query?.trim();
  const type = searchParams?.type;
  const tagId = searchParams?.tagId;
  const archived = searchParams?.archived === "true";
  const dueOnly = searchParams?.dueOnly === "true";
  const sort = searchParams?.sort === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams?.pageSize ?? "20") || 20));

  const where: Prisma.LearningItemWhereInput = {
    userId: session.user.id,
    ...(archived ? {} : { archivedAt: null }),
    ...(type ? { type } : {}),
    ...(tagId
      ? {
          itemTags: {
            some: {
              tagId
            }
          }
        }
      : {}),
    ...(query
      ? {
          OR: [
            { finnishText: { contains: query, mode: "insensitive" } },
            { baseTranslation: { contains: query, mode: "insensitive" } },
            { explanation: { contains: query, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(searchParams?.dateFrom || searchParams?.dateTo
      ? {
          createdAt: {
            ...(searchParams.dateFrom ? { gte: new Date(searchParams.dateFrom) } : {}),
            ...(searchParams.dateTo ? { lte: new Date(searchParams.dateTo) } : {})
          }
        }
      : {}),
    ...(dueOnly
      ? {
          reviewCards: {
            some: {
              suspended: false,
              nextReviewAt: {
                lte: new Date()
              }
            }
          }
        }
      : {})
  };

  const [total, items, tags] = await Promise.all([
    db.learningItem.count({ where }),
    db.learningItem.findMany({
      where,
      include: {
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
      },
      orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    db.tag.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" }
    })
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const sharedParams: Record<string, string | undefined> = {
    query: query || undefined,
    type,
    tagId,
    archived: archived ? "true" : undefined,
    dueOnly: dueOnly ? "true" : undefined,
    sort,
    pageSize: String(pageSize),
    dateFrom: searchParams?.dateFrom,
    dateTo: searchParams?.dateTo
  };

  const prevQuery = buildQueryString({ ...sharedParams, page: String(Math.max(1, page - 1)) });
  const nextQuery = buildQueryString({ ...sharedParams, page: String(Math.min(totalPages, page + 1)) });

  return (
    <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Learning Items</h1>
        <Link href="/items/new" className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          + Add item
        </Link>
      </div>

      <form className="grid gap-3 rounded border p-3 sm:grid-cols-2 lg:grid-cols-4" method="GET">
        <input className="rounded border px-3 py-2 text-sm" name="query" placeholder="Search text" defaultValue={query ?? ""} />
        <select className="rounded border px-3 py-2 text-sm" name="type" defaultValue={type ?? ""}>
          <option value="">All types</option>
          <option value="word">Word</option>
          <option value="phrase">Phrase</option>
          <option value="grammar">Grammar</option>
          <option value="note">Note</option>
        </select>
        <select className="rounded border px-3 py-2 text-sm" name="tagId" defaultValue={tagId ?? ""}>
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
        <select className="rounded border px-3 py-2 text-sm" name="sort" defaultValue={sort}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="dueOnly" value="true" defaultChecked={dueOnly} /> Due only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="archived" value="true" defaultChecked={archived} /> Show archived
        </label>

        <input className="rounded border px-3 py-2 text-sm" type="date" name="dateFrom" defaultValue={searchParams?.dateFrom ?? ""} />
        <input className="rounded border px-3 py-2 text-sm" type="date" name="dateTo" defaultValue={searchParams?.dateTo ?? ""} />

        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="pageSize" value={pageSize} />

        <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
          <button className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
            Apply filters
          </button>
          <Link href="/items" className="rounded border px-4 py-2 text-sm">
            Reset
          </Link>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="rounded border border-dashed p-4 text-sm text-slate-600">No items match your filter.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Link key={item.id} href={`/items/${item.id}`} className="rounded border p-3 hover:bg-slate-50">
              <p className="font-medium">{item.finnishText}</p>
              <p className="text-sm text-slate-600">{item.baseTranslation ?? "No translation yet"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {item.itemTags.map((entry) => (
                  <span key={entry.tagId} className="rounded border px-2 py-0.5 text-xs text-slate-600">
                    {entry.tag.name}
                  </span>
                ))}
                {item.reviewCards[0]?.nextReviewAt ? (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    Next review: {new Date(item.reviewCards[0].nextReviewAt).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between rounded border p-3 text-sm">
        <p>
          Page {page} of {totalPages} · {total} items
        </p>
        <div className="flex gap-2">
          <Link
            href={`/items?${prevQuery}`}
            className={`rounded border px-3 py-1 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
          >
            Previous
          </Link>
          <Link
            href={`/items?${nextQuery}`}
            className={`rounded border px-3 py-1 ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}
