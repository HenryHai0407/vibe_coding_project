"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ItemActionsProps = {
  itemId: string;
  archivedAt: string | null;
};

export function ItemActions({ itemId, archivedAt }: ItemActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"archive" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onArchiveToggle = async () => {
    setError(null);
    setLoading("archive");

    const endpoint = archivedAt ? `/api/items/${itemId}/unarchive` : `/api/items/${itemId}/archive`;
    const response = await fetch(endpoint, { method: "POST" });

    if (!response.ok) {
      setLoading(null);
      setError("Unable to update archive status.");
      return;
    }

    router.refresh();
    setLoading(null);
  };

  const onDelete = async () => {
    const confirmed = window.confirm("Delete this item permanently?");
    if (!confirmed) {
      return;
    }

    setError(null);
    setLoading("delete");
    const response = await fetch(`/api/items/${itemId}`, { method: "DELETE" });

    if (!response.ok) {
      setLoading(null);
      setError("Unable to delete item.");
      return;
    }

    router.push("/items");
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/items/${itemId}/edit`} className="rounded border px-3 py-2 text-sm">
        Edit
      </Link>
      <button className="rounded border px-3 py-2 text-sm" onClick={onArchiveToggle} type="button" disabled={loading === "archive"}>
        {loading === "archive" ? "Saving..." : archivedAt ? "Unarchive" : "Archive"}
      </button>
      <button className="rounded border border-red-300 px-3 py-2 text-sm text-red-700" onClick={onDelete} type="button" disabled={loading === "delete"}>
        {loading === "delete" ? "Deleting..." : "Delete"}
      </button>
      {error ? <p className="w-full text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
