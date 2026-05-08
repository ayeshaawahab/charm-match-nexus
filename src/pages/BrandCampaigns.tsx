import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Loader2, Plus, Sparkles, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type Campaign = {
  id: string;
  name: string | null;
  description: string | null;
  target_audience: string[] | null;
  max_budget: number | null;
  created_at: string;
  status: string | null;
};

function BrandCampaignsInner() {
  useEffect(() => { document.title = "My Campaigns | MatchEngine"; }, []);
  const navigate = useNavigate();
  const { brandId, loading: idsLoading } = useUserIds();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Campaign[]>([]);

  useEffect(() => {
    if (idsLoading) return;
    (async () => {
      if (!brandId) {
        setRows([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name, description, target_audience, max_budget, created_at, status")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });
      if (!error) setRows((data ?? []) as Campaign[]);
      else setRows([]);
      setLoading(false);
    })();
  }, [idsLoading, brandId]);

  const hasItems = useMemo(() => rows.length > 0, [rows]);

  return (
    <main className="min-h-screen mesh-bg px-4 py-10 md:px-10">
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Brand Workspace
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Campaigns</h1>
          </div>
          <Button onClick={() => navigate("/campaign-match")} className="rounded-2xl">
            <Plus className="w-4 h-4" /> New Campaign
          </Button>
        </header>

        {loading || idsLoading ? (
          <div className="tile p-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !hasItems ? (
          <div className="tile p-12 text-center">
            <p className="text-lg font-bold">No campaigns yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first campaign to start matching creators.</p>
            <Button onClick={() => navigate("/campaign-match")} className="rounded-2xl mt-5">
              <Plus className="w-4 h-4" /> New Campaign
            </Button>
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {rows.map((c) => (
              <article key={c.id} className="tile p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold text-lg leading-tight">{c.name ?? "Untitled campaign"}</h2>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${statusTone(c.status)}`}>
                    {c.status ?? "draft"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground min-h-10">{c.description?.trim() || "No description provided."}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Tags className="w-3.5 h-3.5" />
                  <span>{Array.isArray(c.target_audience) && c.target_audience.length > 0 ? c.target_audience.join(", ") : "No audience tags"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <p className="font-semibold">
                    Max budget: <span className="text-primary">${Number(c.max_budget ?? 0).toLocaleString()}</span>
                  </p>
                  <p className="text-muted-foreground inline-flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

const statusTone = (status: string | null) => {
  const value = (status ?? "").toLowerCase();
  if (value === "active") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (value === "completed") return "bg-blue-500/15 text-blue-300 border-blue-500/30";
  if (value === "paused") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export default function BrandCampaigns() {
  return <ErrorBoundary><BrandCampaignsInner /></ErrorBoundary>;
}
