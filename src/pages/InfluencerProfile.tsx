import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Instagram, Twitter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CATEGORY_MAP } from "@/lib/categories";

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
  twitter_handle: string | null;
}

function nicheToCategory(niche?: string | null) {
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

function InfluencerProfileInner() {
  useEffect(() => { document.title = "Influencer Profile | MatchEngine"; }, []);
  const navigate = useNavigate();
  const { influencerId, loading: idsLoading } = useUserIds();
  const [loading, setLoading] = useState(true);
  const [inf, setInf] = useState<InfluencerRow | null>(null);

  useEffect(() => {
    if (idsLoading) return;
    let cancelled = false;
    (async () => {
      if (influencerId) {
        const { data } = await supabase
          .from("influencers")
          .select("id, name, niche, bio, avatar_url, follower_count, engagement_rate, rate_per_post, instagram_handle, twitter_handle")
          .eq("id", influencerId)
          .maybeSingle();
        if (!cancelled && data) {
          setInf(data as InfluencerRow);
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [idsLoading, influencerId]);

  const cat = inf ? CATEGORY_MAP[nicheToCategory(inf.niche)] : null;

  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-10">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {loading || idsLoading ? (
          <div className="bg-card rounded-3xl border border-border p-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !inf || !cat ? (
          <div className="bg-card rounded-3xl border border-border p-10 text-center text-muted-foreground">
            Profile not found.
          </div>
        ) : (
          <div className="bg-card rounded-3xl border border-border overflow-hidden">
            {/* Header: Avatar + Name + Category */}
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-6">
                {inf.avatar_url ? (
                  <img src={inf.avatar_url} alt={inf.name} className="w-24 h-24 rounded-full object-cover border-4 border-primary" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-primary">
                    <span className="text-2xl text-muted-foreground">👤</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-foreground font-serif">{inf.name}</h1>
                  <span
                    className="inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white"
                    style={{ background: cat.hex }}
                  >
                    {inf.niche ?? cat.label}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Followers</p>
                  <p className="text-xl font-bold text-foreground">
                    {inf.follower_count ? (inf.follower_count / 1000000).toFixed(1) + "M" : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Engagement</p>
                  <p className="text-xl font-bold text-primary">{inf.engagement_rate ?? "—"}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Rate/Post</p>
                  <p className="text-xl font-bold text-foreground">{inf.rate_per_post ? `$${inf.rate_per_post}` : "—"}</p>
                </div>
              </div>

              {/* Bio */}
              {inf.bio && (
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{inf.bio}</p>
                </div>
              )}

              {/* Social Links */}
              {(inf.instagram_handle || inf.twitter_handle) && (
                <div className="flex flex-wrap gap-3">
                  {inf.instagram_handle && (
                    <a
                      href={`https://instagram.com/${inf.instagram_handle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
                    >
                      <Instagram className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">@{inf.instagram_handle}</span>
                    </a>
                  )}
                  {inf.twitter_handle && (
                    <a
                      href={`https://x.com/${inf.twitter_handle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
                    >
                      <Twitter className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">@{inf.twitter_handle}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Edit Button */}
              <div className="pt-4">
                <Button
                  onClick={() => navigate("/influencer/profile/edit")}
                  className="rounded-2xl w-full h-11 bg-primary text-primary-foreground"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function InfluencerProfile() {
  return <ErrorBoundary><InfluencerProfileInner /></ErrorBoundary>;
}
