import { motion } from "framer-motion";
import { Building2, ChevronRight } from "lucide-react";
import { SELECTED_BRAND } from "@/lib/mock-data";

const budgetTone: Record<string, string> = {
  Low: "bg-category-fitness/15 text-category-fitness",
  Mid: "bg-category-interior/15 text-category-interior",
  High: "bg-primary/15 text-primary",
};

export const BrandSelector = () => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.15 }}
    className="tile p-6 flex flex-col justify-between gap-4"
  >
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
        <Building2 className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Selected Brand</p>
        <h3 className="text-xl font-bold truncate">{SELECTED_BRAND.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{SELECTED_BRAND.industry}</p>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${budgetTone[SELECTED_BRAND.budget]}`}>
        {SELECTED_BRAND.budget} Budget
      </span>
      <a href="/brands" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
        Change Brand <ChevronRight className="w-4 h-4" />
      </a>
    </div>
  </motion.section>
);
