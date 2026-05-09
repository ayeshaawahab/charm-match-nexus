import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, CheckCircle2, FolderKanban, Inbox, Loader2, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
  const [username, setUsername] = useState("Creator");
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
      setUsername(u?.email?.split("@")[0] ?? "Creator");

      if (!u?.id) {
        setLoading(false);
        return;
      }

      const { data: influencerRow } = await supabase
        .from("influencers")
        .select("id, name, follower_count, engagement_rate")
        .eq("user_id", u.id)
        .maybeSingle();

      if (influencerRow?.name) setUsername(influencerRow.name);
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
      <main className="min-h-screen mesh-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen mesh-bg px-4 py-10 md:px-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Directory
        </button>
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="tile p-7 md:p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-30 mesh-bg pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Creator Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                {username}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm mt-2">Here's what's happening with your campaigns.</p>
          </div>
        </motion.section>

        <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Followers" value={loading ? null : followers.toLocaleString()} />
          <StatCard icon={TrendingUp} label="Engagement" value={loading ? null : `${engagement}%`} />
          <StatCard icon={Activity} label="Active projects" value={loading ? null : String(activeCount)} />
          <StatCard icon={CheckCircle2} label="Completed" value={loading ? null : String(completedCount)} />
        </section>

        <section className="tile p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Recent bookings</h2>
            <Button variant="ghost" className="rounded-2xl" onClick={() => navigate("/influencer/projects")}>
              View all
            </Button>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[0,1,2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="font-semibold">No bookings yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                When brands book you, they'll show up here.
              </p>
              <Button onClick={() => navigate("/influencer/profile")} className="rounded-2xl mt-4">
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
                      <p className="font-semibold truncate text-sm">{b.campaign_name ?? "Untitled campaign"}</p>
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
    </main>
  );
}

const StatCard = ({
  icon: Icon, label, value,
}: { icon: typeof Users; label: string; value: string | null }) => (
  <div className="tile p-5">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
      <Icon className="w-3.5 h-3.5" /> {label}
    </div>
    <div className="mt-2 text-2xl font-extrabold">
      {value === null ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : value}
    </div>
  </div>
);

export default function InfluencerDashboardPage() {
  return <ErrorBoundary><InfluencerDashboardInner /></ErrorBoundary>;
}
