"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ItemIllustrationProps = {
  itemId: string;
};

type IllustrationPayload = {
  image: {
    url: string;
    title: string;
    sourceUrl: string;
  } | null;
};

export function ItemIllustration({ itemId }: ItemIllustrationProps) {
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<IllustrationPayload["image"]>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadIllustration() {
      setLoading(true);
      const response = await fetch(`/api/items/${itemId}/illustration`);
      const data = (await response.json().catch(() => null)) as IllustrationPayload | null;

      if (!cancelled) {
        setImage(data?.image ?? null);
        setLoading(false);
      }
    }

    void loadIllustration();
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  return (
    <div className="rounded border p-3">
      <h2 className="text-sm font-semibold text-slate-800">Illustration (internet)</h2>
      {loading ? <p className="mt-1 text-sm text-slate-600">Loading image...</p> : null}
      {!loading && !image ? <p className="mt-1 text-sm text-slate-600">No relevant image found for this item.</p> : null}
      {image ? (
        <div className="mt-2 space-y-2">
          <Image alt={image.title} className="h-48 w-full rounded object-cover" height={320} src={image.url} unoptimized width={512} />
          <p className="text-xs text-slate-600">
            Source: <a className="underline" href={image.sourceUrl} rel="noreferrer" target="_blank">{image.title}</a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
