"use client";

import { useState } from "react";

type Tag = {
  id: string;
  name: string;
  color: string | null;
};

type ItemTagsManagerProps = {
  itemId: string;
  allTags: Tag[];
  selectedTagIds: string[];
};

export function ItemTagsManager({ itemId, allTags, selectedTagIds }: ItemTagsManagerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedTagIds));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onToggle = async (tagId: string) => {
    const next = new Set(selected);
    if (next.has(tagId)) {
      next.delete(tagId);
    } else {
      next.add(tagId);
    }

    setSelected(next);
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds: Array.from(next) })
    });

    if (!response.ok) {
      setError("Unable to update tags.");
    }

    setSaving(false);
  };

  if (allTags.length === 0) {
    return <p className="text-sm text-slate-600">No tags created yet. Go to Tags page to create tags.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selected.has(tag.id);
          return (
            <button
              key={tag.id}
              className={`rounded border px-3 py-1 text-sm ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "bg-white"}`}
              type="button"
              onClick={() => onToggle(tag.id)}
              disabled={saving}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
