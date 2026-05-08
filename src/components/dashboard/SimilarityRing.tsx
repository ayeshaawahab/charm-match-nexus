import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

export const SimilarityRing = ({ value, size = 56 }: { value: number; size?: number }) => {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = useMotionValue(0);
  const dash = useTransform(progress, (p) => `${(p / 100) * c} ${c}`);
  const text = useTransform(progress, (p) => `${Math.round(p)}%`);

  useEffect(() => {
    if (inView) {
      const ctrl = animate(progress, value, { duration: 1.2, ease: "easeOut" });
      return ctrl.stop;
    }
  }, [inView, value, progress]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg ref={ref} width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="hsl(var(--primary))" strokeWidth={stroke} fill="none" strokeLinecap="round"
          style={{ strokeDasharray: dash }}
        />
      </svg>
      <motion.span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
        {text}
      </motion.span>
    </div>
  );
};
