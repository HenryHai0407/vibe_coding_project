import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ItemsPage({ searchParams }: { searchParams?: { tagId?: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const selectedTagId = searchParams?.tagId;

  const [items, tags] = await Promise.all([
    db.learningItem.findMany({
      where: {
        userId: session.user.id,
        archivedAt: null,
        ...(selectedTagId
          ? {
              itemTags: {
                some: {
                  tagId: selectedTagId
                }
              }
            }
          : {})
      },
      include: {
        itemTags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    }),
    db.tag.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Learning Items</h1>
        <Link href="/items/new" className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          + Add item
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/items" className={`rounded border px-3 py-1 text-sm ${!selectedTagId ? "bg-slate-900 text-white" : ""}`}>
          All
        </Link>
        {tags.map((tag) => (
          <Link key={tag.id} href={`/items?tagId=${tag.id}`} className={`rounded border px-3 py-1 text-sm ${selectedTagId === tag.id ? "bg-slate-900 text-white" : ""}`}>
            {tag.name}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="rounded border border-dashed p-4 text-sm text-slate-600">No items yet for this filter. Create your first learning item.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Link key={item.id} href={`/items/${item.id}`} className="rounded border p-3 hover:bg-slate-50">
              <p className="font-medium">{item.finnishText}</p>
              <p className="text-sm text-slate-600">{item.baseTranslation ?? "No translation yet"}</p>
              {item.itemTags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.itemTags.map((entry) => (
                    <span key={entry.tagId} className="rounded border px-2 py-0.5 text-xs text-slate-600">
                      {entry.tag.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
