import { notFound } from "next/navigation";
import { EditItemForm } from "@/components/items/edit-item-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EditItemPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const item = await db.learningItem.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    select: {
      id: true,
      type: true,
      finnishText: true,
      baseTranslation: true,
      explanation: true,
      usageNote: true,
      sourceContext: true,
      difficulty: true
    }
  });

  if (!item) {
    notFound();
  }

  return <EditItemForm item={item} />;
}
