import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, FolderKanban, Loader2, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BrandSidebar } from "@/components/brand/BrandSidebar";
import { BrandNavbar } from "@/components/brand/BrandNavbar";

type Campaign = {
  id: string;
  name: string | null;
  description: string | null;
  target_audience: string[] | null;
  max_budget: number | null;
  created_at: string;
  status: string | null;
};

type Booking = {
  id: string;
  campaign_id: string;
  influencer_id: string;
  influencer_name: string | null;
  status: string;
  created_at: string;
};

const statusTone = (status: string | null) => {
  const value = (status ?? "").toLowerCase();
  if (value === "active") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (value === "completed") return "bg-blue-500/15 text-blue-300 border-blue-500/30";
  if (value === "paused") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

function BrandCampaignsInner() {
  useEffect(() => { document.title = "Campaigns | MatchEngine"; }, []);
  const navigate = useNavigate();
  const { brandId, loading: idsLoading } = useUserIds();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"current" | "bookings">("current");

  useEffect(() => {
    if (idsLoading) return;
    (async () => {
      if (!brandId) {
        setLoading(false);
        return;
      }

      const [campaignsRes, bookingsRes] = await Promise.all([
        supabase
          .from("campaigns")
          .select("id, name, description, target_audience, max_budget, created_at, status")
          .eq("brand_id", brandId)
          .order("created_at", { ascending: false }),
        supabase
          .from("bookings")
          .select("id, campaign_id, influencer_id, status, created_at, influencer:influencers(name)")
          .eq("brand_id", brandId)
          .order("created_at", { ascending: false }),
      ]);

      setCampaigns((campaignsRes.data ?? []) as Campaign[]);
      setBookings(
        (bookingsRes.data ?? []).map((b: any) => ({
          id: b.id,
          campaign_id: b.campaign_id,
          influencer_id: b.influencer_id,
          influencer_name: b.influencer?.name ?? null,
          status: b.status,
          created_at: b.created_at,
        }))
      );
      setLoading(false);
    })();
  }, [idsLoading, brandId]);

  return (
    <div className="flex min-h-screen bg-background">
      <BrandSidebar />

      <main className="flex-1 flex flex-col">
        <BrandNavbar />

        <div className="flex-1 px-6 py-10">
          <div className="max-w-5xl">
            <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">My Campaigns</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage all your active campaigns</p>
              </div>
              <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
                <TabsList className="rounded-2xl">
                  <TabsTrigger value="current" className="rounded-xl">
                    Current ({campaigns.length})
                  </TabsTrigger>
                  <TabsTrigger value="bookings" className="rounded-xl">
                    Booking Details ({bookings.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Current Campaigns Tab */}
            {tab === "current" && (
              loading ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="bg-card rounded-3xl border border-border p-12 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-3">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-foreground">No campaigns yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Create your first campaign to start matching creators.
                  </p>
                  <Button
                    onClick={() => navigate("/brand/campaigns/new")}
                    className="rounded-2xl mt-4 bg-primary text-primary-foreground hover:opacity-90"
                  >
                    Create Campaign
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {campaigns.map((c) => (
                    <li
                      key={c.id}
                      className="bg-card rounded-2xl border border-border p-4 hover:border-primary/50 transition-all group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                            <FolderKanban className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{c.name ?? "Untitled campaign"}</p>
                            <p className="text-sm text-muted-foreground truncate line-clamp-2">
                              {c.description ?? "No description"}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                              <Tags className="w-3 h-3" />
                              <span className="truncate">
                                {Array.isArray(c.target_audience) && c.target_audience.length > 0
                                  ? c.target_audience.join(", ")
                                  : "No audience tags"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                          {c.max_budget !== null && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                              <DollarSign className="w-3.5 h-3.5" />
                              {Number(c.max_budget).toLocaleString()}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${statusTone(c.status)}`}>
                            {c.status ?? "draft"}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            )}

            {/* Booking Details Tab */}
            {tab === "bookings" && (
              loading ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-card rounded-3xl border border-border p-12 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-3">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-foreground">No bookings yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Influencers you book will appear here.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {bookings.map((b) => {
                    const campaign = campaigns.find((c) => c.id === b.campaign_id);
                    return (
                      <li
                        key={b.id}
                        className="bg-card rounded-2xl border border-border p-4 hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {campaign?.name ?? "Unknown campaign"}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              Influencer: {b.influencer_name ?? "Unknown"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                            <span className="text-xs text-muted-foreground">
                              {new Date(b.created_at).toLocaleDateString()}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${statusTone(b.status)}`}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BrandCampaignsPage() {
  return <ErrorBoundary><BrandCampaignsInner /></ErrorBoundary>;
}
