import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ItemActions } from "@/components/items/item-actions";
import { ItemTagsManager } from "@/components/items/item-tags-manager";
import { ItemExamplesManager } from "@/components/items/item-examples-manager";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const [item, allTags] = await Promise.all([
    db.learningItem.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
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
          orderBy: { createdAt: "asc" }
        }
      }
    }),
    db.tag.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: { name: "asc" }
    })
  ]);

  if (!item) {
    notFound();
  }

  const selectedTagIds = item.itemTags.map((entry) => entry.tagId);

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

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-800">Tags</h2>
        <ItemTagsManager
          itemId={item.id}
          allTags={allTags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }))}
          selectedTagIds={selectedTagIds}
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-800">Examples</h2>
        <ItemExamplesManager
          itemId={item.id}
          initialExamples={item.examples.map((example) => ({
            id: example.id,
            finnishSentence: example.finnishSentence,
            englishTranslation: example.englishTranslation,
            note: example.note
          }))}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-800">Generated review cards</h2>
        {item.reviewCards.length === 0 ? (
          <p className="text-sm text-slate-600">No review cards yet.</p>
        ) : (
          <div className="space-y-2">
            {item.reviewCards.map((card) => (
              <div key={card.id} className="rounded border p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">{card.cardType.replace("_", " ")}</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{card.prompt}</p>
                <p className="mt-1 text-sm text-slate-700">Answer: {card.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
