import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type WikimediaSearchResponse = {
  pages?: Array<{
    id: number;
    key: string;
    title: string;
    thumbnail?: {
      url: string;
      width: number;
      height: number;
    };
  }>;
};

const WIKIPEDIA_SEARCH_ENDPOINT = "https://en.wikipedia.org/w/rest.php/v1/search/page";

function getSearchQuery(finnishText: string, baseTranslation: string | null) {
  const candidate = baseTranslation?.trim() || finnishText.trim();
  return candidate.slice(0, 80);
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const item = await db.learningItem.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    select: {
      finnishText: true,
      baseTranslation: true
    }
  });

  if (!item) {
    return NextResponse.json({ message: "Item not found." }, { status: 404 });
  }

  const q = getSearchQuery(item.finnishText, item.baseTranslation);
  if (!q) {
    return NextResponse.json({ image: null });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const searchUrl = `${WIKIPEDIA_SEARCH_ENDPOINT}?q=${encodeURIComponent(q)}&limit=6`;
    const response = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "vibe-coding-project/1.0"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ image: null });
    }

    const payload = (await response.json().catch(() => null)) as WikimediaSearchResponse | null;
    const withThumbnail = payload?.pages?.find((page) => page.thumbnail?.url);

    if (!withThumbnail?.thumbnail?.url) {
      return NextResponse.json({ image: null });
    }

    return NextResponse.json({
      image: {
        url: withThumbnail.thumbnail.url,
        title: withThumbnail.title,
        sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(withThumbnail.key)}`
      }
    });
  } catch {
    return NextResponse.json({ image: null });
  } finally {
    clearTimeout(timeout);
  }
}
