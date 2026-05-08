import { motion } from "framer-motion";
import { useMemo } from "react";
import { useInfluencers } from "@/hooks/useInfluencers";
import type { SortKey } from "./FilterBar";
import { EmptyResults, ErrorState, InfluencerCard, InfluencerCardSkeleton } from "./InfluencerCard";

interface Props {
  active: Set<string>;
  query: string;
  minFollowers: number;
  sort: SortKey;
  onReset: () => void;
}

export const MatchResults = ({ active, query, minFollowers, sort, onReset }: Props) => {
  const { data, loading, error } = useInfluencers();

  const results = useMemo(() => {
    let r = data.filter((i) =>
      i.username.toLowerCase().includes(query.toLowerCase()) &&
      i.followers >= minFollowers &&
      (active.size === 0 || active.has(i.category))
    );
    r = [...r].sort((a, b) => {
      if (sort === "followers") return b.followers - a.followers;
      if (sort === "engagement") return b.engagement - a.engagement;
      return b.similarity - a.similarity;
    });
    return r;
  }, [data, query, minFollowers, sort, active]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="tile p-6 md:p-7"
    >
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold">Top Matches</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? "Scanning creators…" : error ? "Error loading" : `${results.length} results`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <InfluencerCardSkeleton key={i} />)
          : error
            ? <ErrorState onRetry={() => window.location.reload()} />
            : results.length === 0
              ? <EmptyResults onReset={onReset} />
              : results.map((inf, i) => <InfluencerCard key={inf.id} inf={inf} index={i} />)}
      </div>
    </motion.section>
  );
};
