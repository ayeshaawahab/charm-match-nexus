import { Sparkles, Shirt, UtensilsCrossed, Dumbbell, Users, Plane, Sofa, PawPrint, type LucideIcon } from "lucide-react";

export type CategoryKey =
  | "beauty" | "fashion" | "food" | "fitness"
  | "family" | "travel" | "interior" | "pet";

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  icon: LucideIcon;
  hex: string;
  /** Tailwind color token suffix for `bg-category-*` / `text-category-*` */
  token: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: "beauty",   label: "Beauty",   icon: Sparkles,         hex: "#EC4899", token: "beauty" },
  { key: "fashion",  label: "Fashion",  icon: Shirt,            hex: "#7C3AED", token: "fashion" },
  { key: "food",     label: "Food",     icon: UtensilsCrossed,  hex: "#F97316", token: "food" },
  { key: "fitness",  label: "Fitness",  icon: Dumbbell,         hex: "#10B981", token: "fitness" },
  { key: "family",   label: "Family",   icon: Users,            hex: "#3B82F6", token: "family" },
  { key: "travel",   label: "Travel",   icon: Plane,            hex: "#06B6D4", token: "travel" },
  { key: "interior", label: "Interior", icon: Sofa,             hex: "#F59E0B", token: "interior" },
  { key: "pet",      label: "Pet",      icon: PawPrint,         hex: "#F43F5E", token: "pet" },
];

export const CATEGORY_MAP: Record<CategoryKey, CategoryDef> =
  CATEGORIES.reduce((acc, c) => ({ ...acc, [c.key]: c }), {} as Record<CategoryKey, CategoryDef>);
