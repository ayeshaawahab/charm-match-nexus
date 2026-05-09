import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { CATEGORIES } from "@/lib/categories";
import { formatFollowers } from "@/lib/mock-data";

export type SortKey = "followers" | "engagement";

interface Props {
  query: string;
  onQuery: (v: string) => void;
  active: Set<string>;
  onToggle: (k: string) => void;
  minFollowers: number;
  onMinFollowers: (n: number) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
}

export const FilterBar = (p: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.3 }}
    className="tile p-5 md:p-6 space-y-5"
  >
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={p.query}
          onChange={(e) => p.onQuery(e.target.value)}
          placeholder="Search influencers by name…"
          className="pl-11 h-12 rounded-2xl bg-muted/40 border-border focus-visible:ring-primary"
        />
      </div>
      <div className="flex items-center gap-2 bg-muted/40 rounded-2xl p-1">
        {(["followers", "engagement"] as SortKey[]).map((s) => (
          <button
            key={s}
            onClick={() => p.onSort(s)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors
              ${p.sort === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>

    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => {
        const on = p.active.has(c.key);
        return (
          <button
            key={c.key}
            onClick={() => p.onToggle(c.key)}
            style={{
              backgroundColor: on ? `${c.hex}26` : undefined,
              color: on ? c.hex : undefined,
              borderColor: on ? c.hex : undefined,
            }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
          >
            {c.label}
          </button>
        );
      })}
    </div>

    <div>
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-muted-foreground inline-flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Min Followers
        </span>
        <span className="font-semibold text-primary">{formatFollowers(p.minFollowers)}+</span>
      </div>
      <Slider
        value={[p.minFollowers]}
        onValueChange={(v) => p.onMinFollowers(v[0])}
        min={0}
        max={1_500_000}
        step={50_000}
      />
    </div>
  </motion.div>
);
