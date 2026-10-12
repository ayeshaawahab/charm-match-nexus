import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, CheckCircle2, FolderKanban, Inbox, Loader2, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InfluencerSidebar } from "@/components/influencer/InfluencerSidebar";
import { InfluencerNavbar } from "@/components/influencer/InfluencerNavbar";
import { WelcomeBanner } from "@/components/influencer/WelcomeBanner";

type Booking = {
  id: string;
  campaign_name: string | null;
  status: string;
  created_at: string;
};

function InfluencerDashboardInner() {
  useEffect(() => { document.title = "Influencer Dashboard | MatchEngine"; }, []);
  const navigate = useNavigate();
  const { loading: idsLoading } = useUserIds();
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recent, setRecent] = useState<Booking[]>([]);

  useEffect(() => {
    if (idsLoading) return;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const u = sessionData.session?.user;

      if (!u?.id) {
        setLoading(false);
        return;
      }

      const { data: influencerRow } = await supabase
        .from("influencers")
        .select("id, name, follower_count, engagement_rate")
        .eq("user_id", u.id)
        .maybeSingle();

      setFollowers(influencerRow?.follower_count ?? 0);
      setEngagement(Number(influencerRow?.engagement_rate ?? 0));

      const influencerId = influencerRow?.id ?? null;
      if (influencerId) {
        const [active, completed, recentRes] = await Promise.all([
          supabase.from("bookings").select("id", { count: "exact", head: true }).eq("influencer_id", influencerId).eq("status", "active"),
          supabase.from("bookings").select("id", { count: "exact", head: true }).eq("influencer_id", influencerId).eq("status", "completed"),
          supabase.from("bookings").select("id, status, created_at, campaign:campaigns(name)").eq("influencer_id", influencerId).order("created_at", { ascending: false }).limit(5),
        ]);
        setActiveCount(active.count ?? 0);
        setCompletedCount(completed.count ?? 0);
        setRecent((recentRes.data ?? []).map((b: any) => ({
          id: b.id,
          campaign_name: b.campaign?.name ?? null,
          status: b.status,
          created_at: b.created_at,
        })));
      } else {
        setActiveCount(0);
        setCompletedCount(0);
        setRecent([]);
      }
      setLoading(false);
    })();
  }, [idsLoading]);

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
      <InfluencerSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <InfluencerNavbar />
        <WelcomeBanner />

        <div className="flex-1 px-6 py-10">
          <div className="max-w-6xl space-y-6">
            {/* Stats Grid */}
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} label="Followers" value={loading ? null : followers.toLocaleString()} />
              <StatCard icon={TrendingUp} label="Engagement" value={loading ? null : `${engagement}%`} />
              <StatCard icon={Activity} label="Active campaigns" value={loading ? null : String(activeCount)} />
              <StatCard icon={CheckCircle2} label="Completed" value={loading ? null : String(completedCount)} />
            </section>

            {/* Recent Bookings */}
            <section className="bg-card rounded-3xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-foreground">Recent bookings</h2>
                <Button
                  variant="ghost"
                  className="rounded-2xl text-primary hover:bg-primary/10"
                  onClick={() => navigate("/influencer/bookings")}
                >
                  View all
                </Button>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}
                </div>
              ) : recent.length === 0 ? (
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-3">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-foreground">No bookings yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    When brands book you, they'll show up here.
                  </p>
                  <Button
                    onClick={() => navigate("/influencer/profile")}
                    className="rounded-2xl mt-4 bg-primary text-primary-foreground hover:opacity-90"
                  >
                    Complete your profile
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {recent.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
                          <FolderKanban className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate text-sm text-foreground">{b.campaign_name ?? "Untitled campaign"}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {new Date(b.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-primary/15 text-primary border-primary/40 capitalize">
                        {b.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
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
}: { icon: typeof Users; label: string; value: string | null }) => (
  <div className="bg-card rounded-2xl border border-border p-5">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
      <Icon className="w-3.5 h-3.5" /> {label}
    </div>
    <div className="mt-2 text-2xl font-extrabold text-foreground">
      {value === null ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : value}
    </div>
  </div>
);

export default function InfluencerDashboardPage() {
  return <ErrorBoundary><InfluencerDashboardInner /></ErrorBoundary>;
}
