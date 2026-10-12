import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import type { Influencer } from "@/hooks/useInfluencers";
import { HomeInfluencerCard, HomeInfluencerCardSkeleton } from "./HomeInfluencerCard";

type SortKey = "followers" | "engagement";

interface Props {
  data: Influencer[];
  loading: boolean;
  error: string | null;
  activeCategory: CategoryKey | null;
  onToggleCategory: (cat: CategoryKey) => void;
  searchQuery: string;
  onSearchQuery: (v: string) => void;
  sortBy: SortKey;
  onSortBy: (v: SortKey) => void;
}

const PAGE_SIZE = 9;

export const InfluencerGridSection = ({
  data, loading, error, activeCategory, onToggleCategory, searchQuery, onSearchQuery, sortBy, onSortBy,
}: Props) => {
  const [shown, setShown] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    return data
      .filter((inf) => {
        const matchCat = activeCategory ? inf.category === activeCategory : true;
        const matchSearch = inf.username.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
      })
      .sort((a, b) => (sortBy === "followers" ? b.followers - a.followers : b.engagement - a.engagement));
  }, [data, activeCategory, searchQuery, sortBy]);

  const displayed = filtered.slice(0, shown);
  const hasMore = shown < filtered.length;

  const activeLabel = activeCategory ? CATEGORIES.find((c) => c.key === activeCategory)?.label : null;

  return (
    <section id="influencers" className="py-16" style={{ background: "#F2EDE6" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              {activeLabel ?? "All creators"}
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif">
              {activeLabel ? `Top ${activeLabel} creators` : "Top creators right now"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? "Loading…" : `${filtered.length} results`}
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-full bg-muted border border-border">
            <button
              onClick={() => onSortBy("followers")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                sortBy === "followers" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Followers
            </button>
            <button
              onClick={() => onSortBy("engagement")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                sortBy === "engagement" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Engagement
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => { activeCategory && onToggleCategory(activeCategory); setShown(PAGE_SIZE); }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              !activeCategory ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:border-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { onToggleCategory(cat.key); setShown(PAGE_SIZE); }}
              className="px-4 py-1.5 rounded-full text-sm font-semibold border transition-all"
              style={{
                background: activeCategory === cat.key ? cat.bg : "var(--card)",
                color: activeCategory === cat.key ? cat.hex : "var(--muted-foreground)",
                borderColor: activeCategory === cat.key ? cat.hex : "var(--border)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <HomeInfluencerCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-xl font-medium mb-3">Couldn't load creators.</p>
            <button onClick={() => window.location.reload()} className="text-primary font-semibold text-sm hover:underline">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-xl font-medium mb-3">No creators found.</p>
            <button
              onClick={() => { if (activeCategory) onToggleCategory(activeCategory); onSearchQuery(""); setShown(PAGE_SIZE); }}
              className="text-primary font-semibold text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayed.map((inf) => <HomeInfluencerCard key={inf.id} inf={inf} />)}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setShown((prev) => prev + PAGE_SIZE)}
                  className="px-8 py-2.5 rounded-full border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2"
                >
                  Load more creators
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
