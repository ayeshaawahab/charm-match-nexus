import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
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
  follower_count: string;
  engagement_rate: string;
  rate_per_post: string;
  instagram_handle: string;
  twitter_handle: string;
  avatar_url: string | null;
};

const empty: Form = {
  name: "",
  bio: "",
  niche: "",
  follower_count: "",
  engagement_rate: "",
  rate_per_post: "",
  instagram_handle: "",
  twitter_handle: "",
  avatar_url: null,
};

function InfluencerProfileEditInner() {
  useEffect(() => { document.title = "Edit Profile | MatchEngine"; }, []);
  const navigate = useNavigate();
  const { authId, influencerId, loading: idsLoading } = useUserIds();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rowId, setRowId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const fileRef = useRef<HTMLInputElement>(null);

  const userId = authId;

  const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (idsLoading) return;
    let cancelled = false;
    (async () => {
      if (influencerId) {
        const { data } = await supabase
          .from("influencers")
          .select("id, name, niche, bio, avatar_url, follower_count, engagement_rate, rate_per_post, instagram_handle, twitter_handle")
          .eq("id", influencerId)
          .maybeSingle();
        if (!cancelled && data) {
          setRowId(data.id ?? null);
          setForm({
            name: data.name ?? "",
            bio: data.bio ?? "",
            niche: data.niche ?? "",
            follower_count: data.follower_count?.toString() ?? "",
            engagement_rate: data.engagement_rate?.toString() ?? "",
            rate_per_post: data.rate_per_post?.toString() ?? "",
            instagram_handle: data.instagram_handle ?? "",
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
    if (!userId) {
      toast.error("Not signed in");
      return;
    }
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
    if (!userId) {
      toast.error("Not signed in");
      return;
    }
    setSaving(true);
    const payload: any = {
      name: form.name,
      bio: form.bio,
      niche: form.niche,
      follower_count: form.follower_count ? Number(form.follower_count) : null,
      engagement_rate: form.engagement_rate ? Number(form.engagement_rate) : null,
      rate_per_post: form.rate_per_post ? Number(form.rate_per_post) : null,
      instagram_handle: form.instagram_handle,
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
    navigate("/influencer/profile");
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-10">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {loading || idsLoading ? (
          <div className="bg-card rounded-3xl border border-border p-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-card rounded-3xl border border-border p-6 md:p-8 space-y-6">
            <h1 className="text-2xl font-bold text-foreground font-serif">Edit Profile</h1>

            {/* Avatar Upload */}
            <div className="flex items-center gap-5">
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-primary"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-2xl border-4 border-primary">
                  👤
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
                <Button
                  variant="outline"
                  className="rounded-2xl border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Upload avatar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Form Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Name">
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
              </Field>
              <Field label="Niche">
                <Input value={form.niche} onChange={(e) => update("niche", e.target.value)} placeholder="Beauty, Fashion..." />
              </Field>
              <Field label="Follower count">
                <Input type="number" value={form.follower_count} onChange={(e) => update("follower_count", e.target.value)} />
              </Field>
              <Field label="Engagement rate (%)">
                <Input type="number" step="0.01" value={form.engagement_rate} onChange={(e) => update("engagement_rate", e.target.value)} />
              </Field>
              <Field label="Rate per post (USD)">
                <Input type="number" value={form.rate_per_post} onChange={(e) => update("rate_per_post", e.target.value)} />
              </Field>
            </div>

            <Field label="Bio">
              <Textarea rows={4} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
            </Field>

            {/* Socials Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Instagram">
                <Input value={form.instagram_handle} onChange={(e) => update("instagram_handle", e.target.value)} placeholder="@handle" />
              </Field>
              <Field label="X / Twitter">
                <Input value={form.twitter_handle} onChange={(e) => update("twitter_handle", e.target.value)} placeholder="@handle" />
              </Field>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl w-full h-11 bg-primary text-primary-foreground hover:opacity-90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-foreground">{label}</Label>
    {children}
  </div>
);

export default function InfluencerProfileEdit() {
  return <ErrorBoundary><InfluencerProfileEditInner /></ErrorBoundary>;
}
