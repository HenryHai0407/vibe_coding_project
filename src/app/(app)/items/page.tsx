import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ItemsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const items = await db.learningItem.findMany({
    where: { userId: session.user.id, archivedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Learning Items</h1>
        <Link href="/items/new" className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          + Add item
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded border border-dashed p-4 text-sm text-slate-600">No items yet. Create your first learning item.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Link key={item.id} href={`/items/${item.id}`} className="rounded border p-3 hover:bg-slate-50">
              <p className="font-medium">{item.finnishText}</p>
              <p className="text-sm text-slate-600">{item.baseTranslation ?? "No translation yet"}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
