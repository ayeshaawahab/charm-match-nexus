import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type Form = {
  company_name: string;
  full_name: string;
  industry: string;
  description: string;
  website: string;
  budget_range: string;
  instagram_handle: string;
};

const empty: Form = {
  company_name: "",
  full_name: "",
  industry: "",
  description: "",
  website: "",
  budget_range: "",
  instagram_handle: "",
};

function BrandProfileInner() {
  useEffect(() => { document.title = "Brand Profile | MatchEngine"; }, []);
  const navigate = useNavigate();
  const { authId, loading: idsLoading } = useUserIds();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Form>(empty);

  const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (idsLoading) return;
    (async () => {
      if (!authId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authId)
        .maybeSingle();
      if (data) {
        const row = data as Record<string, unknown>;
        setForm({
          company_name: (row.company_name as string) ?? "",
          full_name: (row.full_name as string) ?? "",
          industry: (row.industry as string) ?? "",
          description: (row.description as string) ?? "",
          website: (row.website as string) ?? "",
          budget_range: (row.budget_range as string) ?? "",
          instagram_handle: (row.instagram_handle as string) ?? "",
        });
      }
      setLoading(false);
    })();
  }, [idsLoading, authId]);

  const handleSave = async () => {
    if (!authId) {
      toast.error("Not signed in");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      company_name: form.company_name,
      full_name: form.full_name,
      industry: form.industry,
      description: form.description,
      website: form.website,
      budget_range: form.budget_range,
      instagram_handle: form.instagram_handle,
    }).eq('id', authId);
    
    if (error) {
      setSaving(false);
      toast.error("Could not save profile", { description: error.message });
      return;
    }

    if (form.instagram_handle) {
      toast.loading("Generating brand vector... (this takes ~2 mins)", { id: "vector-gen" });
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/generate-brand-vector`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand_id: authId,
            instagram_username: form.instagram_handle
          })
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Failed to generate vector");
        }
        
        // Polling logic: check Supabase every 5 seconds until embedding is populated
        const pollInterval = setInterval(async () => {
          const { data, error } = await supabase.from("profiles").select("embedding").eq("id", authId).single();
          if (data && data.embedding !== null) {
            clearInterval(pollInterval);
            toast.success("Profile saved and vector generation complete!", { id: "vector-gen" });
          } else if (error) {
            console.error("Polling error:", error);
          }
        }, 5000);
        
      } catch (err: any) {
        toast.error("Profile saved, but vector generation failed", { 
          id: "vector-gen",
          description: err.message
        });
      }
    } else {
      toast.success("Profile saved");
    }
    
    setSaving(false);
  };

  return (
    <main className="min-h-screen mesh-bg px-4 py-10 md:px-10">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Brand Profile
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
        </header>

        {loading || idsLoading ? (
          <div className="tile p-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="tile p-6 md:p-8 space-y-5">
            <Field label="Company name">
              <Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} />
            </Field>
            <Field label="Full name">
              <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Primary contact name" />
            </Field>
            <Field label="Industry">
              <Input value={form.industry} onChange={(e) => update("industry", e.target.value)} />
            </Field>
            <Field label="Description">
              <Textarea rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} />
            </Field>
            <Field label="Website">
              <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://example.com" />
            </Field>
            <Field label="Budget range">
              <Input value={form.budget_range} onChange={(e) => update("budget_range", e.target.value)} placeholder="e.g. $2,000 - $10,000" />
            </Field>
            <div className="pt-4 border-t border-border">
              <Field label="Brand Instagram Profile Link / Username">
                <Input 
                  value={form.instagram_handle} 
                  onChange={(e) => update("instagram_handle", e.target.value)} 
                  placeholder="e.g. @zara or https://instagram.com/zara" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  When updated, our servers will automatically generate an AI vector to match you with top influencers.
                </p>
              </Field>
            </div>

            <Button onClick={handleSave} disabled={saving} className="rounded-2xl w-full h-11">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save profile"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
  </div>
);

export default function BrandProfile() {
  return <ErrorBoundary><BrandProfileInner /></ErrorBoundary>;
}
