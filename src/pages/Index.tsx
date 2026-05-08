import { useEffect, useState } from "react";
import { Sidebar, MobileNav } from "@/components/dashboard/Sidebar";
import { Hero } from "@/components/dashboard/Hero";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { BrandSelector } from "@/components/dashboard/BrandSelector";
import { CategoryShowcase } from "@/components/dashboard/CategoryShowcase";
import { FilterBar, type SortKey } from "@/components/dashboard/FilterBar";
import { MatchResults } from "@/components/dashboard/MatchResults";
import { InfluencerProfileModal } from "@/components/dashboard/InfluencerProfileModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const IndexInner = () => {
  useEffect(() => { document.title = "Directory | MatchEngine"; }, []);
  const [active, setActive] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [minFollowers, setMinFollowers] = useState(0);
  const [sort, setSort] = useState<SortKey>("similarity");

  const toggle = (k: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  };

  const reset = () => {
    setQuery("");
    setMinFollowers(0);
    setActive(new Set());
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex gap-6 p-4 md:p-6 pb-28 md:pb-6">
        <Sidebar />
        <main className="flex-1 min-w-0 space-y-6">
          <Hero />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><StatsBar /></div>
            <BrandSelector />
          </div>
          <CategoryShowcase active={active} onToggle={toggle} />
          <FilterBar
            query={query} onQuery={setQuery}
            active={active} onToggle={toggle}
            minFollowers={minFollowers} onMinFollowers={setMinFollowers}
            sort={sort} onSort={setSort}
          />
          <div id="results">
            <MatchResults
              active={active}
              query={query}
              minFollowers={minFollowers}
              sort={sort}
              onReset={reset}
            />
          </div>
        </main>
      </div>
      <MobileNav />
      <InfluencerProfileModal />
    </div>
  );
};

const Index = () => (
  <ErrorBoundary>
    <IndexInner />
  </ErrorBoundary>
);

export default Index;
