import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ItemActions } from "@/components/items/item-actions";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const item = await db.learningItem.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    include: {
      examples: {
        orderBy: { position: "asc" }
      }
    }
  });

  if (!item) {
    notFound();
  }

  return (
    <section className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{item.type}</p>
          <h1 className="text-2xl font-semibold">{item.finnishText}</h1>
          <p className="text-slate-700">{item.baseTranslation ?? "No translation"}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link href="/items" className="rounded border px-3 py-2 text-sm">
            Back to items
          </Link>
          <ItemActions itemId={item.id} archivedAt={item.archivedAt ? item.archivedAt.toISOString() : null} />
        </div>
      </div>

      {item.explanation ? (
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Explanation</h2>
          <p className="text-sm text-slate-700">{item.explanation}</p>
        </div>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold text-slate-800">Examples</h2>
        {item.examples.length === 0 ? (
          <p className="text-sm text-slate-600">No examples added.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {item.examples.map((example) => (
              <li key={example.id} className="rounded border p-3 text-sm">
                <p className="font-medium">{example.finnishSentence}</p>
                {example.englishTranslation ? <p className="text-slate-600">{example.englishTranslation}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
