import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { formatFollowers } from "@/lib/mock-data";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const AUDIENCES = ["Gen Z", "Millennials", "Parents", "Tech Enthusiasts", "Fitness Lovers", "Foodies"];
const TIERS = ["Nano", "Micro", "Macro", "Mega"];

type FormState = {
  name: string;
  brand_instagram: string;
  max_budget: string;
  target_audience: string[];
  preferred_tier: string;
  description: string;
};

type MatchResult = {
  id: string;
  name: string;
  niche: string;
  avatar_url: string | null;
  engagement_rate: number;
  rate_per_post: number | null;
  match_score: number;
};

const initial: FormState = {
  name: "",
  brand_instagram: "",
  max_budget: "",
  target_audience: [],
  preferred_tier: "",
  description: "",
};

function CampaignMatchInner() {
  useEffect(() => { document.title = "Campaign Match | MatchEngine"; }, []);
  const { brandId, loading: idsLoading } = useUserIds();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<MatchResult[] | null>(null);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const toggleAudience = (a: string) =>
    update(
      "target_audience",
      form.target_audience.includes(a) ? form.target_audience.filter((x) => x !== a) : [...form.target_audience, a],
    );

  const step1Valid = form.name.trim() && form.brand_instagram.trim();
  const step2Valid = true;

  const next = () => setStep((s) => Math.min(3, s + 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    setResults(null);

    const maxBudget = Number(form.max_budget);

    const { error: insertErr } = await supabase.from("campaigns").insert({
      name: form.name,
      brand_id: brandId,
      brand_instagram: form.brand_instagram,
      max_budget: maxBudget,
      target_audience: form.target_audience,
      preferred_tier: form.preferred_tier,
      description: form.description,
      status: "active",
    });

    if (insertErr) {
      toast({ title: "Could not save campaign", description: insertErr.message, variant: "destructive" });
    }

    const { data: rows, error: rpcErr } = await supabase.rpc(
      "match_influencers_for_brand",
      { p_brand_id: brandId, p_match_count: 10 },
    );

    if (rpcErr) {
      toast({ title: "Could not load matches", description: rpcErr.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const matches: MatchResult[] = (rows ?? []).map((r: any) => ({
      id: String(r.id),
      name: r.name,
      niche: r.niche,
      avatar_url: r.avatar_url,
      engagement_rate: Number(r.engagement_rate ?? 0),
      rate_per_post: r.rate_per_post != null ? Number(r.rate_per_post) : null,
      match_score: Math.round(Math.max(0, Math.min(1, Number(r.similarity ?? 0))) * 10000) / 100,
    }));
    setResults(matches);

    toast({ title: "Campaign launched", description: "Top creator matches are ready below." });
    setSubmitting(false);
  };

  const scoreColor = (s: number) =>
    s > 80 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : s >= 60 ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
      : "bg-red-500/20 text-red-300 border-red-500/40";

  if (idsLoading) {
    return (
      <main className="min-h-screen mesh-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen mesh-bg px-4 py-10 md:px-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Campaign Match
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Find your perfect creators</h1>
          <p className="text-muted-foreground mt-2 text-sm">Tell us about your campaign and we'll match the top influencers.</p>
        </header>

        {/* Progress */}
        <div className="tile p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex-1 flex items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    step >= n ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {step > n ? <Check className="w-4 h-4" /> : n}
                </div>
                {n < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full ${step > n ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Basics</span>
            <span>Targeting</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form */}
        <div className="tile p-6 md:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-xl font-bold">Campaign Basics</h2>
                <div className="space-y-2">
                  <Label>Campaign name</Label>
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Summer Glow 2026" />
                </div>
                <div className="space-y-2">
                  <Label>Brand Instagram handle</Label>
                  <Input value={form.brand_instagram} onChange={(e) => update("brand_instagram", e.target.value)} placeholder="@yourbrand" />
                </div>
                <div className="space-y-2 opacity-40">
                  <Label>Max budget (USD)</Label>
                  <Input type="number" min={0} value={form.max_budget} onChange={(e) => update("max_budget", e.target.value)} placeholder="5000" disabled />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-xl font-bold">Targeting</h2>
                <div className="space-y-2 opacity-40">
                  <Label>Target audience</Label>
                  <div className="flex flex-wrap gap-2">
                    {AUDIENCES.map((a) => (
                      <button
                        key={a}
                        type="button"
                        disabled
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-muted/40 text-muted-foreground border-border cursor-not-allowed"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 opacity-40">
                  <Label>Preferred influencer tier</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {TIERS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        disabled
                        className="px-3 py-2 rounded-2xl text-sm font-semibold border bg-muted/40 text-foreground border-border cursor-not-allowed"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 opacity-40">
                  <Label>Campaign description</Label>
                  <Textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Describe your goals, deliverables, and creative direction..."
                    disabled
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-xl font-bold">Review</h2>
                <div className="bg-muted/30 rounded-2xl p-5 space-y-3 border border-border/40">
                  <SummaryRow label="Campaign" value={form.name} />
                  <SummaryRow label="Brand IG" value={form.brand_instagram} />
                  <SummaryRow label="Max budget" value={`$${Number(form.max_budget).toLocaleString()}`} />
                  <SummaryRow label="Audience" value={form.target_audience.join(", ") || "—"} />
                  <SummaryRow label="Tier" value={form.preferred_tier} />
                  <SummaryRow label="Description" value={form.description} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              disabled={submitting}
              className="rounded-2xl"
              onClick={() => (step > 1 ? setStep(step - 1) : navigate("/"))}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            {step < 3 ? (
              <Button
                onClick={next}
                disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
                className="rounded-2xl"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="rounded-2xl">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Matching...</> : <>Launch & Match <Sparkles className="w-4 h-4" /></>}
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        {submitting && !results && (
          <div className="tile p-10 mt-8 flex flex-col items-center text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Finding your top creator matches...</p>
          </div>
        )}

        {results && (
          <section className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Top 10 matches</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {results.map((r, i) => {
                const overBudget = r.rate_per_post != null && r.rate_per_post > Number(form.max_budget);
                return (
                  <motion.article
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="tile p-5 flex items-center gap-4"
                  >
                    <div className="relative shrink-0">
                      {r.avatar_url ? (
                        <img src={r.avatar_url} alt={r.name} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {r.name?.[0] ?? "?"}
                        </div>
                      )}
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-card">
                        #{i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{r.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{r.niche}</p>
                      <p className="text-xs mt-1">
                        Engagement <span className="font-semibold text-foreground">{r.engagement_rate}%</span>
                        {r.rate_per_post != null && (
                          <> · Rate <span className="font-semibold text-foreground">${formatFollowers(r.rate_per_post)}</span></>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${scoreColor(r.match_score)}`}>
                        {r.match_score.toFixed(2)}% match
                      </span>
                      {r.rate_per_post != null && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            overBudget
                              ? "bg-red-500/15 text-red-300 border-red-500/30"
                              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {overBudget ? "Over Budget" : "Within Budget"}
                        </span>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 text-sm">
    <span className="sm:w-32 shrink-0 text-muted-foreground uppercase text-[11px] tracking-wider font-semibold">{label}</span>
    <span className="font-medium break-words">{value || "—"}</span>
  </div>
);

export default function CampaignMatch() {
  return <ErrorBoundary><CampaignMatchInner /></ErrorBoundary>;
}
