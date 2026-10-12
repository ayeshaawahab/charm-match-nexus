import { CATEGORY_MAP } from "@/lib/categories";
import type { Influencer } from "@/hooks/useInfluencers";

export const HomeInfluencerCard = ({ inf }: { inf: Influencer }) => {
  const cat = CATEGORY_MAP[inf.category];

  return (
    <article className="bg-card rounded-2xl border border-border p-5 space-y-4 hover:shadow-lg transition-shadow">
      {/* Header: Circular Image + Name/Category + Engagement */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center bg-muted">
            {inf.image ? (
              <img src={inf.image} alt={inf.username} className="w-full h-full object-cover" />
            ) : (
              <cat.icon className="w-6 h-6" style={{ color: cat.hex }} />
            )}
          </div>
          <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm">
            #{inf.rank}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-foreground truncate">{inf.username}</h3>
          <span className="text-xs font-semibold text-white rounded-full px-2 py-0.5 mt-1 inline-block" style={{ background: cat.hex }}>
            {cat.label}
          </span>
        </div>

        <div className="shrink-0">
          <span className="text-xs font-semibold text-primary">{inf.engagement}%</span>
        </div>
      </div>

      {/* Stats Grid — 2x2 */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">Followers</p>
          <p className="text-base font-bold text-foreground">
            {inf.followers >= 1000000 ? `${(inf.followers / 1000000).toFixed(1)}M` : `${(inf.followers / 1000).toFixed(0)}K`}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">Engagement</p>
          <p className="text-base font-bold text-primary">{inf.engagement}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">Following</p>
          <p className="text-base font-bold text-foreground">{inf.following}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">Posts</p>
          <p className="text-base font-bold text-foreground">{inf.posts}</p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
        onClick={() => {
          const event = new CustomEvent("open-influencer-modal", { detail: { influencer: inf } });
          document.dispatchEvent(event);
        }}
      >
        View Profile
      </button>
    </article>
  );
};

export const HomeInfluencerCardSkeleton = () => (
  <div className="bg-card rounded-2xl border border-border p-5 space-y-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-14 h-14 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
      <div className="w-4 h-4 bg-muted rounded-full shrink-0" />
    </div>
    <div className="grid grid-cols-2 gap-6 gap-y-3">
      {[0, 1, 2, 3].map((i) => <div key={i} className="h-6 bg-muted rounded" />)}
    </div>
    <div className="h-10 bg-muted rounded-lg" />
  </div>
);
