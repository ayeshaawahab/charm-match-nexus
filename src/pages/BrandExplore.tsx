import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import { formatFollowers } from "@/lib/mock-data";
import { useInfluencers } from "@/hooks/useInfluencers";
import { InfluencerProfileModal } from "@/components/dashboard/InfluencerProfileModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BrandSidebar } from "@/components/brand/BrandSidebar";
import { BrandNavbar } from "@/components/brand/BrandNavbar";

type SortDirection = "high" | "low";

function BrandExploreInner() {
  useEffect(() => { document.title = "Explore | MatchEngine"; }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [sortBy, setSortBy] = useState<"followers" | "engagement">("engagement");
  const [sortDirection, setSortDirection] = useState<SortDirection>("high");
  const [displayCount, setDisplayCount] = useState(9);
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: allInfluencers, loading } = useInfluencers();

  const filtered = useMemo(() => {
    let result = [...allInfluencers];

    // Sort
    if (sortBy === "engagement") {
      result.sort((a, b) => b.engagement - a.engagement);
    } else {
      result.sort((a, b) => b.followers - a.followers);
    }
    if (sortDirection === "low") {
      result.reverse();
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((inf) =>
        inf.username.toLowerCase().includes(term) || inf.category.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((inf) => inf.category === selectedCategory);
    }

    return result;
  }, [allInfluencers, searchTerm, selectedCategory, sortBy, sortDirection]);

  const displayed = filtered.slice(0, displayCount);

  return (
    <div className="flex min-h-screen bg-background">
      <BrandSidebar />

      <main className="flex-1 flex flex-col">
        <BrandNavbar />

        <div className="flex-1 px-6 py-10">
          <div className="max-w-6xl space-y-6">
            {/* Header */}
            <section>
              <h1 className="text-3xl font-bold font-serif text-foreground mb-2">Explore creators</h1>
              <p className="text-sm text-muted-foreground">Browse all available influencers</p>
            </section>

            {/* Search + Sort */}
            <section className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortBy((v) => (v === "engagement" ? "followers" : "engagement"))}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortBy === "engagement" ? "Engagement" : "Followers"}
                </button>
                <button
                  onClick={() => setSortDirection((v) => (v === "high" ? "low" : "high"))}
                  className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground hover:bg-muted transition-colors"
                >
                  {sortDirection === "high" ? "↓" : "↑"}
                </button>
              </div>
            </section>

            {/* Categories */}
            <section>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex flex-col items-center gap-2 group`}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
                    style={{ background: selectedCategory === null ? "#C7522A" : "#7E6753" }}
                  >
                    {/* All button - use generic icon or skip */}
                  </div>
                  <span className={`text-xs font-medium ${selectedCategory === null ? "text-primary" : "text-foreground"}`}>
                    All
                  </span>
                </button>
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-105"
                        style={{ background: isActive ? "#C7522A" : "#7E6753" }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className={`text-xs font-medium text-center ${isActive ? "text-primary font-bold" : "text-foreground"}`}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Grid */}
            <section>
              <p className="text-sm text-muted-foreground mb-4">{filtered.length} results</p>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className="h-72 rounded-2xl" />
                  ))}
                </div>
              ) : displayed.length === 0 ? (
                <div className="bg-card rounded-3xl border border-border p-12 flex flex-col items-center text-center">
                  <p className="font-semibold text-foreground">No creators found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayed.map((inf) => (
                      <div key={inf.id} className="bg-card rounded-2xl border border-border p-6">
                        {/* Header: Rank + Avatar + Name */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Rank Badge */}
                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-sm">
                              #{inf.rank}
                            </div>
                            
                            {/* Avatar + Name + Category */}
                            <div className="min-w-0 flex-1">
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary mb-2">
                                {inf.image ? (
                                  <img src={inf.image} alt={inf.username} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {inf.username[0]}
                                  </div>
                                )}
                              </div>
                              <h3 className="font-bold text-sm text-foreground truncate">{inf.username}</h3>
                              <span
                                className="inline-block px-2 py-1 rounded-full text-[10px] font-bold text-white mt-1"
                                style={{ backgroundColor: CATEGORIES.find((c) => c.key === inf.category)?.hex }}
                              >
                                {CATEGORIES.find((c) => c.key === inf.category)?.label}
                              </span>
                            </div>
                          </div>
                          
                          {/* Engagement % Top Right */}
                          <div className="text-right ml-2">
                            <p className="text-xs text-muted-foreground">ENGAGEMENT</p>
                            <p className="text-lg font-bold text-primary">{inf.engagement}%</p>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {/* Followers */}
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">Followers</p>
                            <p className="text-sm font-bold text-foreground">{formatFollowers(inf.followers)}</p>
                          </div>
                          
                          {/* Following */}
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">Following</p>
                            <p className="text-sm font-bold text-foreground">{inf.following}</p>
                          </div>
                          
                          {/* Posts */}
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">Posts</p>
                            <p className="text-sm font-bold text-foreground">{inf.posts}</p>
                          </div>
                          
                          {/* Similarity */}
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">Match</p>
                            <p className="text-sm font-bold text-foreground">{inf.similarity}%</p>
                          </div>
                        </div>

                        {/* View Profile Button */}
                        <Button
                          onClick={() => {
                            setSelectedInfluencerId(inf.id);
                            setModalOpen(true);
                          }}
                          className="w-full rounded-2xl bg-primary text-primary-foreground hover:opacity-90 h-10 text-sm"
                        >
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Load More */}
                  {displayCount < filtered.length && (
                    <div className="flex justify-center mt-8">
                      <Button
                        onClick={() => setDisplayCount((v) => v + 9)}
                        variant="outline"
                        className="rounded-2xl border-primary text-primary hover:bg-primary/10"
                      >
                        Load more creators
                      </Button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Influencer Profile Modal */}
      {modalOpen && selectedInfluencerId && (
        <InfluencerProfileModal
          influencerId={selectedInfluencerId}
          onClose={() => {
            setModalOpen(false);
            setSelectedInfluencerId(null);
          }}
        />
      )}
    </div>
  );
}

export default function BrandExplore() {
  return <ErrorBoundary><BrandExploreInner /></ErrorBoundary>;
}
