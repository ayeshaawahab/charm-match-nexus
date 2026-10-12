import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, FolderKanban, Loader2, Zap, Calendar, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BrandSidebar } from "@/components/brand/BrandSidebar";
import { BrandNavbar } from "@/components/brand/BrandNavbar";

type Campaign = {
  id: string;
  name: string | null;
  status: string | null;
  created_at: string;
};

function BrandDashboardInner() {
  useEffect(() => { document.title = "Brand Dashboard | MatchEngine"; }, []);
  const navigate = useNavigate();
  const { brandId, loading: idsLoading } = useUserIds();
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState("Untitled Brand");
  const [campaignCount, setCampaignCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recent, setRecent] = useState<Campaign[]>([]);

  useEffect(() => {
    if (idsLoading) return;
    (async () => {
      if (!brandId) {
        setLoading(false);
        return;
      }

      const { data: brandData } = await supabase
        .from("brands")
        .select("id, company_name")
        .eq("id", brandId)
        .maybeSingle();

      if (brandData?.company_name) setBrandName(brandData.company_name);

      const [campaigns, active, bookings, completed, recentCampaigns] = await Promise.all([
        supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("brand_id", brandId),
        supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("brand_id", brandId).eq("status", "active"),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("brand_id", brandId),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("brand_id", brandId).eq("status", "completed"),
        supabase.from("campaigns").select("id, name, status, created_at").eq("brand_id", brandId).order("created_at", { ascending: false }).limit(5),
      ]);

      setCampaignCount(campaigns.count ?? 0);
      setActiveCount(active.count ?? 0);
      setBookingCount(bookings.count ?? 0);
      setCompletedCount(completed.count ?? 0);
      setRecent((recentCampaigns.data ?? []) as Campaign[]);
      setLoading(false);
    })();
  }, [idsLoading, brandId]);

  if (idsLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <BrandSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <BrandNavbar />

        <div className="flex-1 px-6 py-10">
          <div className="max-w-6xl space-y-6">
            {/* Welcome Banner */}
            <div
              className="rounded-3xl p-8 text-white"
              style={{ background: "#C7522A" }}
            >
              <div>
                <h1 className="text-3xl font-bold font-serif mb-2">Welcome back</h1>
                <p className="text-primary-foreground/90 text-sm">
                  Track campaigns, discover creators, and manage your bookings —<br />
                  all in one warm little corner.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <section className="grid gap-4 grid-cols-4">
              <StatCard icon={FolderKanban} label="CAMPAIGNS" value={loading ? null : String(campaignCount)} />
              <StatCard icon={Activity} label="ACTIVE" value={loading ? null : String(activeCount)} />
              <StatCard icon={Calendar} label="BOOKINGS" value={loading ? null : String(bookingCount)} />
              <StatCard icon={CheckCircle2} label="COMPLETED" value={loading ? null : String(completedCount)} />
            </section>

            {/* Two Column Layout */}
            <section className="grid grid-cols-3 gap-6">
              {/* Recent Campaigns */}
              <div className="col-span-2 bg-card rounded-3xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground font-serif">Recent campaigns</h2>
                  <Button
                    variant="ghost"
                    className="text-primary hover:bg-transparent"
                    onClick={() => navigate("/brand/campaigns")}
                  >
                    View all
                  </Button>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                  </div>
                ) : recent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FolderKanban className="w-12 h-12 text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-semibold text-foreground">No campaigns yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first campaign to start matching creators.
                    </p>
                    <Button
                      onClick={() => navigate("/brand/campaigns/new")}
                      className="rounded-2xl mt-4 bg-primary text-primary-foreground hover:opacity-90"
                    >
                      New Campaign
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {recent.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-sm text-foreground">{c.name ?? "Untitled"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-primary/15 text-primary border-primary/40 capitalize">
                          {c.status ?? "draft"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Brand Details */}
              <div className="bg-card rounded-3xl border border-border p-6 flex flex-col">
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-6">Brand Details</p>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{brandName}</h3>
                    <p className="text-xs text-muted-foreground">Brand account</p>
                  </div>
                </div>
                <div className="flex-1" />
                <Button
                  onClick={() => navigate("/brand/profile")}
                  variant="outline"
                  className="rounded-2xl border-primary text-primary hover:bg-primary/10 w-full"
                >
                  Edit profile
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

const StatCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: string | null;
}) => (
  <div className="bg-card rounded-2xl border border-border p-6">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-muted-foreground mb-3">
      <Icon className="w-4 h-4" style={{ color: "#C7522A" }} />
      {label}
    </div>
    <div className="text-3xl font-extrabold text-foreground">
      {value === null ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : value}
    </div>
  </div>
);

export default function BrandDashboardPage() {
  return <ErrorBoundary><BrandDashboardInner /></ErrorBoundary>;
}
