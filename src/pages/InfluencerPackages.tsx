import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Package as PackageIcon, Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useUserIds } from "@/hooks/useUserIds";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type Tier = "Basic" | "Standard" | "Premium";
type Pkg = {
  id: string;
  influencer_id: string | null;
  name: string;
  tier: Tier;
  description: string | null;
  price: number;
  delivery_days: number;
  revisions: number;
};

const TIERS: Tier[] = ["Basic", "Standard", "Premium"];
const tierStyle = (t: Tier) =>
  t === "Premium" ? "bg-primary/20 text-primary border-primary/40"
  : t === "Standard" ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
  : "bg-muted text-muted-foreground border-border";

function InfluencerPackagesInner() {
  useEffect(() => { document.title = "Influencer Packages | MatchEngine"; }, []);
  const navigate = useNavigate();
  const { influencerId, loading: idsLoading } = useUserIds();
  const [loading, setLoading] = useState(true);
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pkg | null>(null);

  const load = async (uid: string | null) => {
    setLoading(true);
    let q = supabase.from("influencer_packages").select("*").order("price", { ascending: true });
    if (uid) q = q.eq("influencer_id", uid);
    const { data, error } = await q;
    if (error) toast.error("Could not load packages", { description: error.message });
    else setPkgs((data ?? []) as Pkg[]);
    setLoading(false);
  };

  useEffect(() => {
    if (idsLoading) return;
    load(influencerId);
  }, [idsLoading, influencerId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    const { error } = await supabase.from("influencer_packages").delete().eq("id", id);
    if (error) { toast.error("Delete failed", { description: error.message }); return; }
    setPkgs((p) => p.filter((x) => x.id !== id));
    toast.success("Package deleted");
  };

  return (
    <main className="min-h-screen mesh-bg px-4 py-10 md:px-10">
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/influencer/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> My Packages
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Packages</h1>
          </div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="rounded-2xl">
            <Plus className="w-4 h-4" /> Add Package
          </Button>
        </header>

        {loading || idsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0,1,2].map((i) => (
              <div key={i} className="tile p-5 space-y-3">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-9 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : pkgs.length === 0 ? (
          <div className="tile p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-4">
              <PackageIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold">No packages yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Create your first package so brands can book you instantly.
            </p>
            <Button onClick={() => { setEditing(null); setOpen(true); }} className="rounded-2xl mt-5">
              <Plus className="w-4 h-4" /> Create Package
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pkgs.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="tile p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold truncate">{p.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tierStyle(p.tier)}`}>
                    {p.tier}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">{p.description ?? "—"}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Stat label="Price" value={`$${Number(p.price).toLocaleString()}`} />
                  <Stat label="Days" value={`${p.delivery_days}`} />
                  <Stat label="Revisions" value={`${p.revisions}`} />
                </div>
                <div className="flex gap-2 mt-auto pt-2">
                  <Button variant="secondary" className="rounded-2xl flex-1" onClick={() => { setEditing(p); setOpen(true); }}>
                    <Pencil className="w-4 h-4" /> Edit
                  </Button>
                  <Button variant="ghost" className="rounded-2xl text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      <PackageDialog
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        userId={influencerId}
        onSaved={(saved) => {
          setPkgs((prev) => {
            const idx = prev.findIndex((p) => p.id === saved.id);
            if (idx === -1) return [...prev, saved];
            const next = [...prev];
            next[idx] = saved;
            return next;
          });
        }}
      />
    </main>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-muted/40 rounded-xl px-2 py-1.5">
    <div className="text-muted-foreground text-[9px] uppercase tracking-wider">{label}</div>
    <div className="font-semibold text-xs">{value}</div>
  </div>
);

const PackageDialog = ({
  open, onClose, editing, userId, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editing: Pkg | null;
  userId: string | null;
  onSaved: (p: Pkg) => void;
}) => {
  const [form, setForm] = useState({
    name: "", tier: "Basic" as Tier, description: "",
    price: "", delivery_days: "", revisions: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        tier: editing.tier,
        description: editing.description ?? "",
        price: String(editing.price),
        delivery_days: String(editing.delivery_days),
        revisions: String(editing.revisions),
      });
    } else {
      setForm({ name: "", tier: "Basic", description: "", price: "", delivery_days: "", revisions: "" });
    }
  }, [editing, open]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const payload = {
      influencer_id: userId,
      name: form.name,
      tier: form.tier.toLowerCase(),
      description: form.description,
      price: Number(form.price) || 0,
      delivery_days: Number(form.delivery_days) || 0,
      revisions: Number(form.revisions) || 0,
    };
    const q = editing
      ? supabase.from("influencer_packages").update(payload).eq("id", editing.id).select().single()
      : supabase.from("influencer_packages").insert(payload).select().single();
    const { data, error } = await q;
    setSaving(false);
    if (error || !data) { toast.error("Save failed", { description: error?.message }); return; }
    onSaved(data as Pkg);
    toast.success(editing ? "Package updated" : "Package created");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border/60">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit package" : "Add package"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Tier</Label>
            <div className="grid grid-cols-3 gap-2">
              {TIERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, tier: t })}
                  className={`px-3 py-2 rounded-2xl text-sm font-semibold border transition-all ${
                    form.tier === t ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-foreground border-border hover:border-primary/60"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Delivery (days)</Label>
              <Input type="number" value={form.delivery_days} onChange={(e) => setForm({ ...form, delivery_days: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Revisions</Label>
              <Input type="number" value={form.revisions} onChange={(e) => setForm({ ...form, revisions: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" className="rounded-2xl" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-2xl">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function InfluencerPackages() {
  return <ErrorBoundary><InfluencerPackagesInner /></ErrorBoundary>;
}
