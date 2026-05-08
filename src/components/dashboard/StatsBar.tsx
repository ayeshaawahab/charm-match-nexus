import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { STATS } from "@/lib/mock-data";

const Counter = ({ to, suffix, literal }: { to: number; suffix: string; literal?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString() + suffix);

  useEffect(() => {
    if (inView && !literal) {
      const c = animate(mv, to, { duration: 1.4, ease: "easeOut" });
      return c.stop;
    }
  }, [inView, to, mv, literal]);

  if (literal) return <span ref={ref}>{literal}</span>;
  return <motion.span ref={ref}>{rounded}</motion.span>;
};

export const StatsBar = () => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className="tile p-6 md:p-7"
  >
    <div className="grid grid-cols-3 gap-6">
      {STATS.map((s, i) => (
        <div key={i} className="flex flex-col">
          <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            <Counter to={s.value} suffix={s.suffix} literal={(s as { literal?: string }).literal} />
          </span>
          <span className="text-sm text-muted-foreground mt-1">{s.label}</span>
        </div>
      ))}
    </div>
  </motion.section>
);
