import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { CATEGORIES, CATEGORY_MAP, type CategoryKey } from "@/lib/categories";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BrandSidebar } from "@/components/brand/BrandSidebar";
import { BrandNavbar } from "@/components/brand/BrandNavbar";
import { Skeleton } from "@/components/ui/skeleton";

type Influencer = {
  id: string;
  name: string;
  niche: string;
  avatar_url: string | null;
  follower_count: number;
  engagement_rate: number;
  similarity: number;
};

function BrandCategoriesInner() {
  useEffect(() => { document.title = "Categories | MatchEngine"; }, []);
  
  const { loading: idsLoading } = useUserIds();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [categoryCount, setCategoryCount] = useState<Record<CategoryKey, number>>({} as any);
  const [loadingInfluencers, setLoadingInfluencers] = useState(false);

  // Load category counts on mount
  useEffect(() => {
    (async () => {
      const counts: Record<CategoryKey, number> = {} as any;
      for (const cat of CATEGORIES) {
        const { count } = await supabase
          .from("influencers")
          .select("id", { count: "exact", head: true })
          .ilike("niche", `%${cat.label}%`);
        counts[cat.key] = count ?? 0;
      }
      setCategoryCount(counts);
    })();
  }, []);

  // Load influencers when category selected
  useEffect(() => {
    if (!selectedCategory) return;

    (async () => {
      setLoadingInfluencers(true);
      const categoryDef = CATEGORY_MAP[selectedCategory];
      const { data } = await supabase
        .from("influencers")
        .select("id, name, niche, avatar_url, follower_count, engagement_rate")
        .ilike("niche", `%${categoryDef.label}%`)
        .order("follower_count", { ascending: false })
        .limit(50);

      setInfluencers(
        (data ?? []).map((inf: any) => ({
          ...inf,
          similarity: Math.random() * 20 + 75, // Mock similarity 75-95
        }))
      );
      setLoadingInfluencers(false);
    })();
  }, [selectedCategory]);

  return (
    <div className="flex min-h-screen bg-background">
      <BrandSidebar />
      <main className="flex-1 flex flex-col">
        <BrandNavbar />

        <div className="flex-1 px-6 py-10">
          <div className="max-w-5xl">
            <div className="mb-8">
              <h1 className="font-serif text-2xl font-bold text-foreground">Browse by Category</h1>
              <p className="text-sm text-muted-foreground mt-1">Find creators in your niche</p>
            </div>

            {/* Categories List */}
            <div className="space-y-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const count = categoryCount[cat.key] ?? 0;
                const isSelected = selectedCategory === cat.key;

                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-primary/15 border-primary text-foreground"
                        : "bg-card border-border text-foreground hover:bg-muted hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cat.hex + "20", color: cat.hex }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm">{cat.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {count} {count === 1 ? "creator" : "creators"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-3xl border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border shrink-0">
              <h2 className="font-serif text-lg font-bold text-foreground">
                {CATEGORY_MAP[selectedCategory].label} Creators
              </h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {loadingInfluencers ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                  ))}
                </div>
              ) : influencers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="font-semibold text-foreground">No creators found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try another category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {influencers.map((inf) => (
                    <div
                      key={inf.id}
                      className="bg-card rounded-2xl border border-border p-4 hover:border-primary/50 transition-all group cursor-pointer"
                    >
                      {/* Avatar */}
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted mb-3 shrink-0">
                        {inf.avatar_url ? (
                          <img
                            src={inf.avatar_url}
                            alt={inf.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-3xl font-bold text-primary/40">
                              {inf.name[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {inf.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mb-3">
                        {inf.niche}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-muted rounded-lg p-2">
                          <p className="text-muted-foreground">Followers</p>
                          <p className="font-bold text-foreground">
                            {(inf.follower_count / 1000).toFixed(1)}K
                          </p>
                        </div>
                        <div className="bg-muted rounded-lg p-2">
                          <p className="text-muted-foreground">Engagement</p>
                          <p className="font-bold text-foreground">
                            {inf.engagement_rate.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Similarity Badge */}
                      <div className="bg-primary/15 border border-primary/30 rounded-full py-1.5 px-3 text-center">
                        <p className="text-[10px] font-bold text-primary">
                          {inf.similarity.toFixed(0)}% Match
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrandCategories() {
  return <ErrorBoundary><BrandCategoriesInner /></ErrorBoundary>;
}
