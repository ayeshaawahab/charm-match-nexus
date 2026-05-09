import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  influencerId: string;
  influencerName: string;
}

export const InquiryFormDialog = ({ open, onOpenChange, influencerId, influencerName }: Props) => {
  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setCampaignName("");
    setMessage("");
    setBudget("");
    setTimeline("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const brandId = sessionData.session?.user.id ?? null;

      const { error } = await supabase.from("inquiries").insert({
        influencer_id: influencerId,
        brand_id: brandId,
        campaign_description: `${campaignName}\n\n${message}`,
        budget_range: budget,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Inquiry sent successfully");
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send inquiry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="tile border-border/50 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Send inquiry to {influencerName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign">Campaign name</Label>
            <Input id="campaign" required value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input id="budget" placeholder="e.g. PKR 50k–100k" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Input id="timeline" placeholder="e.g. 2 weeks" value={timeline} onChange={(e) => setTimeline(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="rounded-2xl">
              {submitting ? "Sending…" : "Send inquiry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
