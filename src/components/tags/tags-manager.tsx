"use client";

import { FormEvent, useState } from "react";

type Tag = {
  id: string;
  name: string;
  color: string | null;
};

type TagsManagerProps = {
  initialTags: Tag[];
};

export function TagsManager({ initialTags }: TagsManagerProps) {
  const [tags, setTags] = useState(initialTags);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#22c55e");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createTag = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color })
    });

    const data = (await response.json().catch(() => null)) as { tag?: Tag; message?: string } | null;
    if (!response.ok || !data?.tag) {
      setError(data?.message ?? "Unable to create tag.");
      setLoading(false);
      return;
    }

    setTags((current) => [...current, data.tag].sort((a, b) => a.name.localeCompare(b.name)));
    setName("");
    setLoading(false);
  };

  const deleteTag = async (tagId: string) => {
    setError(null);
    const response = await fetch(`/api/tags/${tagId}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Unable to delete tag.");
      return;
    }

    setTags((current) => current.filter((tag) => tag.id !== tagId));
  };

  return (
    <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Tags</h1>

      <form className="flex flex-wrap items-end gap-3" onSubmit={createTag}>
        <label className="space-y-1">
          <span className="text-sm font-medium">Tag name</span>
          <input className="w-48 rounded border px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Color</span>
          <input className="h-10 w-20 rounded border px-1" type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        </label>

        <button className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create tag"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {tags.length === 0 ? (
        <p className="text-sm text-slate-600">No tags yet.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {tags.map((tag) => (
            <li key={tag.id} className="flex items-center justify-between rounded border p-3 text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: tag.color ?? "#94a3b8" }} />
                {tag.name}
              </span>
              <button className="text-red-700 underline" onClick={() => deleteTag(tag.id)} type="button">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
