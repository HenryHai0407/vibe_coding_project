import { TagsManager } from "@/components/tags/tags-manager";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function TagsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const tags = await db.tag.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" }
  });

  return <TagsManager initialTags={tags} />;
}
