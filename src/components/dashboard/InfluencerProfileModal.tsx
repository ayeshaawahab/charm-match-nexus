import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { X, Instagram, Youtube, Twitter, Music2, Users, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { CATEGORY_MAP, type CategoryKey } from "@/lib/categories";
import { formatFollowers } from "@/lib/mock-data";
import { InquiryFormDialog } from "./InquiryFormDialog";

interface InfluencerRow {
  id: string;
  name: string;
  niche: string | null;
  bio: string | null;
  avatar_url: string | null;
  follower_count: number | null;
  engagement_rate: number | null;
  rate_per_post: number | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  twitter_handle: string | null;
}

interface PackageRow {
  id: string;
  tier: string | null;
  name: string | null;
  price: number | null;
  delivery_days: number | null;
}

function nicheToCategory(niche?: string | null): CategoryKey {
  const n = (niche ?? "").toLowerCase();
  if (n.includes("beauty") || n.includes("skin")) return "beauty";
  if (n.includes("food")) return "food";
  if (n.includes("fit") || n.includes("health") || n.includes("gym")) return "fitness";
  if (n.includes("family") || n.includes("parent")) return "family";
  if (n.includes("travel")) return "travel";
  if (n.includes("interior") || n.includes("home")) return "interior";
  if (n.includes("pet") || n.includes("animal")) return "pet";
  return "fashion";
}

export const InfluencerProfileModal = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inf, setInf] = useState<InfluencerRow | null>(null);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  

  // Listen for "View Profile" button clicks via event delegation
  useEffect(() => {
    const handler = async (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const btn = target.closest("button");
      if (!btn || btn.textContent?.trim() !== "View Profile") return;
      const article = btn.closest("article");
      if (!article) return;
      const heading = article.querySelector("h3");
      const username = heading?.textContent?.trim();
      if (!username) return;

      e.preventDefault();
      setOpen(true);
      setLoading(true);
      setInf(null);
      setPackages([]);

      const { data: row } = await supabase
        .from("influencers")
        .select("id, name, niche, bio, avatar_url, follower_count, engagement_rate, rate_per_post, instagram_handle, tiktok_handle, youtube_handle, twitter_handle")
        .eq("name", username)
        .maybeSingle();

      if (row) {
        setInf(row as InfluencerRow);
        const { data: pkgs } = await supabase
          .from("influencer_packages")
          .select("id, tier, name, price, delivery_days")
          .eq("influencer_id", (row as InfluencerRow).id);
        setPackages((pkgs as PackageRow[]) ?? []);
      }
      setLoading(false);
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const cat = inf ? CATEGORY_MAP[nicheToCategory(inf.niche)] : null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="tile relative w-full max-w-3xl my-8 p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-muted/40 hover:bg-muted text-foreground flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {loading && (
                <div className="py-20 text-center text-muted-foreground text-sm">Loading profile…</div>
              )}

              {!loading && !inf && (
                <div className="py-20 text-center text-muted-foreground text-sm">Profile not found.</div>
              )}

              {!loading && inf && cat && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    {inf.avatar_url ? (
                      <img src={inf.avatar_url} alt={inf.name} className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${cat.hex}33` }}
                      >
                        <cat.icon className="w-8 h-8" style={{ color: cat.hex }} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-2xl font-bold truncate">{inf.name}</h2>
                      <span
                        className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ backgroundColor: `${cat.hex}26`, color: cat.hex }}
                      >
                        {inf.niche ?? cat.label}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  {inf.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{inf.bio}</p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <StatBlock icon={<Users className="w-4 h-4" />} label="Followers" value={formatFollowers(inf.follower_count ?? 0)} />
                    <StatBlock icon={<TrendingUp className="w-4 h-4" />} label="Engagement" value={`${inf.engagement_rate ?? 0}%`} />
                    <StatBlock icon={<DollarSign className="w-4 h-4" />} label="Rate / post" value={inf.rate_per_post ? `PKR ${formatFollowers(inf.rate_per_post)}` : "—"} />
                  </div>

                  {/* Socials */}
                  {(inf.instagram_handle || inf.tiktok_handle || inf.youtube_handle || inf.twitter_handle) && (
                    <div className="flex flex-wrap gap-2">
                      {inf.instagram_handle && <Social icon={<Instagram className="w-3.5 h-3.5" />} handle={inf.instagram_handle} />}
                      {inf.tiktok_handle && <Social icon={<Music2 className="w-3.5 h-3.5" />} handle={inf.tiktok_handle} />}
                      {inf.youtube_handle && <Social icon={<Youtube className="w-3.5 h-3.5" />} handle={inf.youtube_handle} />}
                      {inf.twitter_handle && <Social icon={<Twitter className="w-3.5 h-3.5" />} handle={inf.twitter_handle} />}
                    </div>
                  )}

                  {/* Packages */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Packages</h3>
                    {packages.length === 0 ? (
                      <div className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-4">No packages available.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {packages.map((p) => (
                          <div key={p.id} className="bg-muted/40 rounded-xl p-4 border border-border/40">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-primary">{p.tier ?? "Package"}</span>
                              {p.price != null && <span className="font-bold text-sm">PKR {formatFollowers(p.price)}</span>}
                            </div>
                            <div className="font-semibold text-sm">{p.name ?? "—"}</div>
                            {p.delivery_days != null && (
                              <div className="text-xs text-muted-foreground mt-1">{p.delivery_days} day delivery</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      onClick={() => setInquiryOpen(true)}
                      className="rounded-2xl flex-1 bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Send Inquiry
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <InquiryFormDialog
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        influencerId={inf?.id ?? ""}
        influencerName={inf?.name ?? ""}
      />
    </>
  );
};

const StatBlock = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-muted/40 rounded-xl px-3 py-3">
    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase tracking-wider">
      {icon}{label}
    </div>
    <div className="font-bold text-base mt-1">{value}</div>
  </div>
);

const Social = ({ icon, handle }: { icon: React.ReactNode; handle: string }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 text-xs font-medium">
    {icon}{handle}
  </span>
);
