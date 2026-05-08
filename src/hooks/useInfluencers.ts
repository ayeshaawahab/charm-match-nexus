import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CategoryKey } from "@/lib/categories";

export interface Influencer {
  id: string;
  rank: number;
  username: string;
  category: CategoryKey;
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  similarity: number;
  image?: string;
}

function mapNicheToCategory(niche: string): CategoryKey {
  const n = niche?.toLowerCase() ?? "";
  if (n.includes("beauty") || n.includes("skin")) return "beauty";
  if (n.includes("fashion") || n.includes("style")) return "fashion";
  if (n.includes("food") || (n.includes("travel") && n.includes("food"))) return "food";
  if (n.includes("fit") || n.includes("health") || n.includes("gym")) return "fitness";
  if (n.includes("family") || n.includes("parent")) return "family";
  if (n.includes("travel")) return "travel";
  if (n.includes("interior") || n.includes("home")) return "interior";
  if (n.includes("pet") || n.includes("animal")) return "pet";
  return "fashion";
}

const mapRow = (row: any, index: number): Influencer => ({
  id: String(row.id),
  rank: index + 1,
  username: row.name,
  category: mapNicheToCategory(row.niche),
  followers: row.follower_count ?? 0,
  following: row.following_count ?? 0,
  posts: row.post_count ?? 0,
  engagement: Number(row.engagement_rate ?? 0),
  similarity: 85,
  image: row.avatar_url ?? undefined,
});

export const useInfluencers = () => {
  const [data, setData] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      const { data: rows, error: fetchError } = await supabase
        .from("influencers")
        .select(
          "id, name, niche, follower_count, following_count, post_count, engagement_rate, avatar_url"
        );

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setData([]);
      } else {
        const mapped = (rows ?? [])
          .map((r, i) => mapRow(r, i))
          .sort((a, b) => b.similarity - a.similarity)
          .map((inf, i) => ({ ...inf, rank: i + 1 }));
        setData(mapped);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
};
