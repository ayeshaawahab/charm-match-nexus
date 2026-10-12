import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BrandSidebar } from "@/components/brand/BrandSidebar";
import { BrandNavbar } from "@/components/brand/BrandNavbar";
import { toast } from "sonner";

const AUDIENCE_OPTIONS = ["GenZ", "Millennials", "Parents", "Tech Enthusiasts", "Fitness Lovers", "Foodies"];
const TIER_OPTIONS = ["Nano", "Micro", "Macro", "Mega"];

function BrandNewCampaignInner() {
  useEffect(() => { document.title = "New Campaign | MatchEngine"; }, []);
  const navigate = useNavigate();
  const { brandId, loading: idsLoading } = useUserIds();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [topMatches, setTopMatches] = useState<any[]>([]);
  
  // Form state
  const [name, setName] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const toggleAudience = (audience: string) => {
    setSelectedAudience((prev) =>
      prev.includes(audience) ? prev.filter((a) => a !== audience) : [...prev, audience]
    );
  };

  const canProceedBasics = name.trim().length > 0;

  const handleLaunchAndMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId) {
      toast.error("Brand ID not found");
      return;
    }

    setLoading(true);
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert([
        {
          brand_id: brandId,
          name: name.trim(),
          description: description.trim() || null,
          max_budget: budget ? parseInt(budget) : null,
          target_audience: selectedAudience,
          preferred_tier: selectedTier,
          status: "active",
        },
      ])
      .select()
      .single();

    if (campaignError) {
      toast.error(`Failed to create campaign: ${campaignError.message}`);
      setLoading(false);
      return;
    }

    // Fetch top 10 influencers based on matching
    const { data: influencers, error: influencersError } = await supabase
      .from("influencers")
      .select("id, name, niche, follower_count, engagement_rate, avatar_url, rank")
      .limit(10)
      .order("rank", { ascending: true });

    setLoading(false);

    if (influencersError) {
      toast.error("Failed to fetch top matches");
      return;
    }

    setTopMatches(influencers || []);
    setLaunched(true);
    toast.success("Campaign launched!");
  };

  if (idsLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (launched) {
    return (
      <div className="flex min-h-screen bg-background">
        <BrandSidebar />
        <main className="flex-1 flex flex-col">
          <BrandNavbar />
          <div className="flex-1 px-6 py-10 overflow-auto">
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold font-serif text-foreground mb-8">Top 10 matches</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topMatches.map((inf) => (
                  <div key={inf.id} className="bg-card rounded-2xl border border-border p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shrink-0">
                        {inf.avatar_url ? (
                          <img src={inf.avatar_url} alt={inf.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {inf.name?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{inf.name}</h3>
                        <p className="text-xs text-muted-foreground">{inf.niche}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary-foreground">#{inf.rank}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Followers</p>
                        <p className="font-bold text-foreground">{(inf.follower_count / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-bold text-foreground">{inf.engagement_rate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/brand/campaigns")}
                className="mt-8 px-6 py-2 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                View Campaign
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <BrandSidebar />

      <main className="flex-1 flex flex-col">
        <BrandNavbar />

        <div className="flex-1 px-6 py-10 overflow-auto">
          <div className="max-w-2xl">
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        step === s
                          ? "bg-primary text-primary-foreground"
                          : step > s
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {step > s ? <Check className="w-5 h-5" /> : s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          step > s ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Basics</span>
                <span>Targeting</span>
                <span>Review</span>
              </div>
            </div>

            {/* Step 1: Basics */}
            {step === 1 && (
              <div className="bg-card rounded-2xl border border-border p-8">
                <h2 className="text-2xl font-bold font-serif text-foreground mb-6">Campaign Basics</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Campaign name</Label>
                    <Input
                      placeholder="e.g., summer glow"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-2xl h-11 bg-background border-primary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Brand Instagram handle (optional)</Label>
                    <Input
                      placeholder="@yourbrand"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      className="rounded-2xl h-11 bg-background border-primary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max budget (USD)</Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="rounded-2xl h-11 bg-background border-primary/30"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/brand/campaigns")}
                      className="rounded-2xl"
                    >
                      Back
                    </Button>
                    <Button
                      disabled={!canProceedBasics}
                      onClick={() => setStep(2)}
                      className="rounded-2xl ml-auto bg-primary hover:bg-primary/90"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Targeting */}
            {step === 2 && (
              <div className="bg-card rounded-2xl border border-border p-8">
                <h2 className="text-2xl font-bold font-serif text-foreground mb-6">Targeting</h2>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Target audience</Label>
                    <div className="flex flex-wrap gap-2">
                      {AUDIENCE_OPTIONS.map((aud) => (
                        <button
                          key={aud}
                          onClick={() => toggleAudience(aud)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedAudience.includes(aud)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground border border-border hover:border-primary"
                          }`}
                        >
                          {aud}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Preferred influencer tier</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIER_OPTIONS.map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
                          className={`py-3 rounded-xl font-medium text-sm transition-all ${
                            selectedTier === tier
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground border border-border hover:border-primary"
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Campaign description</Label>
                    <textarea
                      placeholder="Describe your goals, deliverables, and creative direction..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full h-32 px-4 py-3 rounded-2xl bg-background border border-primary/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="rounded-2xl"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="rounded-2xl ml-auto bg-primary hover:bg-primary/90"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-card rounded-2xl border border-border p-8">
                <h2 className="text-2xl font-bold font-serif text-foreground mb-6">Review</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 py-3 border-b border-border/50">
                    <span className="text-xs font-bold text-muted-foreground uppercase w-24">Campaign</span>
                    <span className="text-foreground font-semibold">{name}</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 border-b border-border/50">
                    <span className="text-xs font-bold text-muted-foreground uppercase w-24">Brand IG</span>
                    <span className="text-foreground">{instagramHandle || "—"}</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 border-b border-border/50">
                    <span className="text-xs font-bold text-muted-foreground uppercase w-24">Max Budget</span>
                    <span className="text-foreground font-semibold">${budget || "0"}</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 border-b border-border/50">
                    <span className="text-xs font-bold text-muted-foreground uppercase w-24">Audience</span>
                    <span className="text-foreground">{selectedAudience.join(", ") || "—"}</span>
                  </div>
                  <div className="flex items-center gap-4 py-3 border-b border-border/50">
                    <span className="text-xs font-bold text-muted-foreground uppercase w-24">Tier</span>
                    <span className="text-foreground">{selectedTier || "—"}</span>
                  </div>
                  <div className="flex items-center gap-4 py-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase w-24">Description</span>
                    <span className="text-foreground text-sm">{description.length || "0"}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="rounded-2xl"
                  >
                    Back
                  </Button>
                  <Button
                    disabled={loading}
                    onClick={handleLaunchAndMatch}
                    className="rounded-2xl ml-auto bg-primary hover:bg-primary/90"
                  >
                    {loading ? "Launching..." : "Launch & Match"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BrandNewCampaign() {
  return <ErrorBoundary><BrandNewCampaignInner /></ErrorBoundary>;
}
