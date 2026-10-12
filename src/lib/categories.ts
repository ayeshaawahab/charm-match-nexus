import { Sparkles, Shirt, UtensilsCrossed, Dumbbell, Users, Plane, Sofa, PawPrint, type LucideIcon } from "lucide-react";

export type CategoryKey =
  | "beauty" | "fashion" | "food" | "fitness"
  | "family" | "travel" | "interior" | "pet";

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  icon: LucideIcon;
  hex: string;
  /** Light tint for chip/pill backgrounds */
  bg: string;
  /** Tailwind color token suffix for `bg-category-*` / `text-category-*` */
  token: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: "beauty",   label: "Beauty",   icon: Sparkles,         hex: "#E8538A", bg: "#FDF0F6", token: "beauty" },
  { key: "fashion",  label: "Fashion",  icon: Shirt,            hex: "#7C3AED", bg: "#F5F0FF", token: "fashion" },
  { key: "food",     label: "Food",     icon: UtensilsCrossed,  hex: "#D97706", bg: "#FFFBEB", token: "food" },
  { key: "fitness",  label: "Fitness",  icon: Dumbbell,         hex: "#059669", bg: "#F0FFF8", token: "fitness" },
  { key: "family",   label: "Family",   icon: Users,            hex: "#2563EB", bg: "#EFF6FF", token: "family" },
  { key: "travel",   label: "Travel",   icon: Plane,            hex: "#0891B2", bg: "#F0FDFF", token: "travel" },
  { key: "interior", label: "Interior", icon: Sofa,             hex: "#B45309", bg: "#FFF8ED", token: "interior" },
  { key: "pet",      label: "Pet",      icon: PawPrint,         hex: "#DC2626", bg: "#FFF5F5", token: "pet" },
];

export const CATEGORY_MAP: Record<CategoryKey, CategoryDef> =
  CATEGORIES.reduce((acc, c) => ({ ...acc, [c.key]: c }), {} as Record<CategoryKey, CategoryDef>);
