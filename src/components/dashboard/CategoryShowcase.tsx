import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/categories";

export const CategoryShowcase = ({
  active, onToggle,
}: { active: Set<string>; onToggle: (k: string) => void }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="tile p-6 md:p-7"
  >
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-xl font-bold">Categories</h2>
        <p className="text-sm text-muted-foreground">Tap to filter matches</p>
      </div>
    </div>
    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
      {CATEGORIES.map((c, i) => {
        const Icon = c.icon;
        const isActive = active.has(c.key);
        return (
          <motion.button
            key={c.key}
            onClick={() => onToggle(c.key)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.04 }}
            whileHover={{ scale: 1.05, boxShadow: `0 0 28px ${c.hex}88` }}
            whileTap={{ scale: 0.97 }}
            style={{
              backgroundColor: isActive ? `${c.hex}1A` : "rgba(15,15,26,0.6)",
              borderColor: c.hex,
              borderWidth: isActive ? 2.5 : 1.5,
              color: c.hex,
              boxShadow: `inset 0 0 16px ${c.hex}33`,
            }}
            className="aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all"
          >
            <Icon className="w-6 h-6" style={{ color: c.hex }} />
            <span className="text-xs font-semibold">{c.label}</span>
          </motion.button>
        );
      })}
    </div>
  </motion.section>
);
