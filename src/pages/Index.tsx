import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { InfluencerGridSection } from "@/components/home/InfluencerGridSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { CTASection } from "@/components/home/CTASection";
import { Footer } from "@/components/home/Footer";
import { InfluencerProfileModal } from "@/components/dashboard/InfluencerProfileModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useInfluencers } from "@/hooks/useInfluencers";
import type { CategoryKey } from "@/lib/categories";

type SortKey = "followers" | "engagement";

const IndexInner = () => {
  useEffect(() => { document.title = "MatchEngine | Where brands meet their perfect voice"; }, []);

  const { data, loading, error } = useInfluencers();

  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("followers");

  const toggleCategory = (cat: CategoryKey) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
  };

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const avgEngagement = useMemo(() => {
    if (data.length === 0) return 0;
    return data.reduce((sum, i) => sum + i.engagement, 0) / data.length;
  }, [data]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />

      <HeroSection
        searchQuery={searchQuery}
        onSearchQuery={setSearchQuery}
        onSearchSubmit={() => scrollTo("influencers")}
        onQuickCategory={(catLabel) => {
          const key = catLabel.toLowerCase() as CategoryKey;
          setActiveCategory(key);
          scrollTo("influencers");
        }}
      />

      <StatsSection influencerCount={data.length} avgEngagement={avgEngagement} loading={loading} />

      <CategoriesSection
        activeCategory={activeCategory}
        onToggle={(cat) => { toggleCategory(cat); scrollTo("influencers"); }}
      />

      <InfluencerGridSection
        data={data}
        loading={loading}
        error={error}
        activeCategory={activeCategory}
        onToggleCategory={toggleCategory}
        searchQuery={searchQuery}
        onSearchQuery={setSearchQuery}
        sortBy={sortBy}
        onSortBy={setSortBy}
      />

      <HowItWorksSection />
      <CTASection />
      <Footer />

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
