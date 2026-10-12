import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, DollarSign, FolderKanban, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InfluencerSidebar } from "@/components/influencer/InfluencerSidebar";
import { InfluencerNavbar } from "@/components/influencer/InfluencerNavbar";

type Booking = {
  id: string;
  status: string;
  created_at: string;
  campaign_name: string | null;
  campaign_budget: number | null;
  brand_name: string | null;
};

const statusTone = (status: string) => {
  const value = status.toLowerCase();
  if (value === "active") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (value === "completed") return "bg-blue-500/15 text-blue-300 border-blue-500/30";
  if (value === "paused") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

function InfluencerBookingsInner() {
  useEffect(() => { document.title = "Bookings | MatchEngine"; }, []);
  const navigate = useNavigate();
  const { influencerId, loading: idsLoading } = useUserIds();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    if (idsLoading) return;
    (async () => {
      if (!influencerId) {
        setRows([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("bookings")
        .select("id, status, created_at, campaign:campaigns(name, max_budget), brand:profiles(company_name)")
        .eq("influencer_id", influencerId)
        .order("created_at", { ascending: false });

      if (!error) {
        setRows(
          (data ?? []).map((b: any) => ({
            id: b.id,
            status: b.status,
            created_at: b.created_at,
            campaign_name: b.campaign?.name ?? null,
            campaign_budget: b.campaign?.max_budget ?? null,
            brand_name: b.brand?.company_name ?? null,
          }))
        );
      } else {
        setRows([]);
      }
      setLoading(false);
    })();
  }, [idsLoading, influencerId]);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.status.toLowerCase() === filter);
  }, [rows, filter]);

  const counts = useMemo(() => ({
    all: rows.length,
    active: rows.filter((r) => r.status.toLowerCase() === "active").length,
    completed: rows.filter((r) => r.status.toLowerCase() === "completed").length,
  }), [rows]);

  return (
    <div className="flex min-h-screen bg-background">
      <InfluencerSidebar />

      <main className="flex-1 flex flex-col">
        <InfluencerNavbar />

        <div className="flex-1 px-6 py-10">
          <div className="max-w-4xl space-y-6">
            <header className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">My Bookings</h1>
                <p className="text-sm text-muted-foreground mt-1">Campaigns brands have booked you for.</p>
              </div>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <TabsList className="rounded-2xl">
                  <TabsTrigger value="all" className="rounded-xl">All ({counts.all})</TabsTrigger>
                  <TabsTrigger value="active" className="rounded-xl">Active ({counts.active})</TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-xl">Completed ({counts.completed})</TabsTrigger>
                </TabsList>
              </Tabs>
            </header>

            {loading || idsLoading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-card rounded-3xl border border-border p-12 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="font-semibold text-foreground">
                  {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
                </p>
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
              <ul className="space-y-3">
                {filtered.map((b) => (
                  <li
                    key={b.id}
                    className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between gap-3 flex-wrap"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                        <FolderKanban className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate text-sm text-foreground">
                          {b.campaign_name ?? "Untitled campaign"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {b.brand_name ?? "Unknown brand"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {b.campaign_budget !== null && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                          <DollarSign className="w-3.5 h-3.5" />
                          {Number(b.campaign_budget).toLocaleString()}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${statusTone(b.status)}`}>
                        {b.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function InfluencerBookings() {
  return <ErrorBoundary><InfluencerBookingsInner /></ErrorBoundary>;
}
