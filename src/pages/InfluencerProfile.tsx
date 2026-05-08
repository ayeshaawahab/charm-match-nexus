import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Sparkles, Upload, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type Form = {
  name: string;
  bio: string;
  niche: string;
  location: string;
  follower_count: string;
  engagement_rate: string;
  rate_per_post: string;
  instagram_handle: string;
  tiktok_handle: string;
  youtube_handle: string;
  twitter_handle: string;
  avatar_url: string | null;
};

const empty: Form = {
  name: "", bio: "", niche: "", location: "",
  follower_count: "", engagement_rate: "", rate_per_post: "",
  instagram_handle: "", tiktok_handle: "", youtube_handle: "", twitter_handle: "",
  avatar_url: null,
};

function InfluencerProfileInner() {
  useEffect(() => { document.title = "Influencer Profile | MatchEngine"; }, []);
  const navigate = useNavigate();
  const { authId, influencerId, loading: idsLoading } = useUserIds();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rowId, setRowId] = useState<string | null>(null);
  const [handle, setHandle] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const fileRef = useRef<HTMLInputElement>(null);

  const userId = authId;

  const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (idsLoading) return;
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const social = (sessionData.session?.user?.user_metadata as any)?.social_handle ?? null;
      if (cancelled) return;
      setHandle(social);
      if (influencerId) {
        const { data } = await supabase
          .from("influencers")
          .select("*")
          .eq("id", influencerId)
          .maybeSingle();
        if (!cancelled && data) {
          setRowId(data.id ?? null);
          setForm({
            name: data.name ?? "",
            bio: data.bio ?? "",
            niche: data.niche ?? "",
            location: data.location ?? "",
            follower_count: data.follower_count?.toString() ?? "",
            engagement_rate: data.engagement_rate?.toString() ?? "",
            rate_per_post: data.rate_per_post?.toString() ?? "",
            instagram_handle: data.instagram_handle ?? social ?? "",
            tiktok_handle: data.tiktok_handle ?? "",
            youtube_handle: data.youtube_handle ?? "",
            twitter_handle: data.twitter_handle ?? "",
            avatar_url: data.avatar_url ?? null,
          });
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [idsLoading, influencerId]);

  const handleAvatar = async (file: File) => {
    if (!userId) { toast.error("Not signed in"); return; }
    setUploading(true);
    const path = `${userId}/${Date.now()}_${file.name.replace(/[^\w.\-]/g, "_")}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Upload failed", { description: error.message });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    update("avatar_url", data.publicUrl);
    setUploading(false);
    toast.success("Avatar uploaded");
  };

  const handleSave = async () => {
    if (!userId) { toast.error("Not signed in"); return; }
    setSaving(true);
    const payload: any = {
      name: form.name,
      bio: form.bio,
      niche: form.niche,
      location: form.location,
      follower_count: form.follower_count ? Number(form.follower_count) : null,
      engagement_rate: form.engagement_rate ? Number(form.engagement_rate) : null,
      rate_per_post: form.rate_per_post ? Number(form.rate_per_post) : null,
      instagram_handle: handle ?? form.instagram_handle,
      tiktok_handle: form.tiktok_handle,
      youtube_handle: form.youtube_handle,
      twitter_handle: form.twitter_handle,
      avatar_url: form.avatar_url,
    };
    const { error } = rowId
      ? await supabase.from("influencers").update(payload).eq("id", rowId)
      : await supabase.from("influencers").insert({ ...payload, user_id: userId });
    setSaving(false);
    if (error) {
      toast.error("Could not save", { description: error.message });
      return;
    }
    toast.success("Profile saved");
  };

  return (
    <main className="min-h-screen mesh-bg px-4 py-10 md:px-10">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/influencer/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Creator Profile
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your profile</h1>
        </header>

        {loading || idsLoading ? (
          <div className="tile p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="tile p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-5">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="avatar" className="w-20 h-20 rounded-full object-cover border border-border/50" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
              )}
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleAvatar(e.target.files[0])}
                />
                <Button variant="secondary" className="rounded-2xl" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading..." : "Upload avatar"}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Name"><Input value={form.name} onChange={(e) => update("name", e.target.value)} /></Field>
              <Field label="Niche"><Input value={form.niche} onChange={(e) => update("niche", e.target.value)} placeholder="Beauty, Fashion..." /></Field>
              <Field label="Location"><Input value={form.location} onChange={(e) => update("location", e.target.value)} /></Field>
              <Field label="Follower count"><Input type="number" value={form.follower_count} onChange={(e) => update("follower_count", e.target.value)} /></Field>
              <Field label="Engagement rate (%)"><Input type="number" step="0.01" value={form.engagement_rate} onChange={(e) => update("engagement_rate", e.target.value)} /></Field>
              <Field label="Rate per post (USD)"><Input type="number" value={form.rate_per_post} onChange={(e) => update("rate_per_post", e.target.value)} /></Field>
            </div>

            <Field label="Bio"><Textarea rows={4} value={form.bio} onChange={(e) => update("bio", e.target.value)} /></Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Instagram"><Input value={form.instagram_handle} onChange={(e) => update("instagram_handle", e.target.value)} placeholder="@handle" /></Field>
              <Field label="TikTok"><Input value={form.tiktok_handle} onChange={(e) => update("tiktok_handle", e.target.value)} placeholder="@handle" /></Field>
              <Field label="YouTube"><Input value={form.youtube_handle} onChange={(e) => update("youtube_handle", e.target.value)} placeholder="channel" /></Field>
              <Field label="Twitter"><Input value={form.twitter_handle} onChange={(e) => update("twitter_handle", e.target.value)} placeholder="@handle" /></Field>
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

export default function InfluencerProfile() {
  return <ErrorBoundary><InfluencerProfileInner /></ErrorBoundary>;
}
