import { motion } from "framer-motion";
import { Users, Heart, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_MAP } from "@/lib/categories";
import { formatFollowers, type Influencer } from "@/lib/mock-data";
import { SimilarityRing } from "./SimilarityRing";

export const InfluencerCard = ({ inf, index }: { inf: Influencer; index: number }) => {
  const cat = CATEGORY_MAP[inf.category];
  const Icon = cat.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      style={{ borderLeft: `3px solid ${cat.hex}` }}
      className="tile p-5 flex flex-col gap-4 transition-shadow duration-300 hover:shadow-[0_0_32px_hsl(var(--primary)/0.4)]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            {inf.image ? (
              <img src={inf.image} alt={inf.username} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${cat.hex}33` }}
                aria-label="No image"
              >
                <Icon className="w-6 h-6" style={{ color: cat.hex }} />
              </div>
            )}
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-card">
              #{inf.rank}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold truncate">{inf.username}</h3>
            <span
              className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: `${cat.hex}26`, color: cat.hex }}
            >
              {cat.label}
            </span>
          </div>
        </div>
        <SimilarityRing value={inf.engagement} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Stat label="Followers" value={formatFollowers(inf.followers)} />
        <Stat label="Engagement" value={`${inf.engagement}%`} />
        <Stat label="Following" value={formatFollowers(inf.following)} />
        <Stat label="Posts" value={formatFollowers(inf.posts)} />
      </div>

      <Button className="rounded-2xl w-full mt-auto bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground">
        View Profile
      </Button>
    </motion.article>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-muted/40 rounded-xl px-3 py-2">
    <div className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</div>
    <div className="font-semibold text-sm">{value}</div>
  </div>
);

export const InfluencerCardSkeleton = () => (
  <div className="tile p-5 animate-pulse-soft">
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mt-4">
      {[0,1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded-xl" />)}
    </div>
    <div className="h-10 bg-muted rounded-2xl mt-4" />
  </div>
);

export const EmptyResults = ({ onReset }: { onReset: () => void }) => (
  <div className="tile col-span-full p-10 flex flex-col items-center text-center">
    <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-4">
      <ImageIcon className="w-7 h-7" />
    </div>
    <h3 className="text-lg font-bold">No matches found</h3>
    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
      Try adjusting your filters or clearing categories to discover more creators.
    </p>
    <Button onClick={onReset} className="rounded-2xl mt-5"><Users className="w-4 h-4 mr-1" /> Reset filters</Button>
  </div>
);

export const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="tile col-span-full p-10 flex flex-col items-center text-center">
    <div className="w-16 h-16 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mb-4">
      <Heart className="w-7 h-7" />
    </div>
    <h3 className="text-lg font-bold">Couldn't load matches</h3>
    <p className="text-sm text-muted-foreground mt-1">Something went wrong fetching results.</p>
    <Button onClick={onRetry} className="rounded-2xl mt-5">Retry</Button>
  </div>
);
