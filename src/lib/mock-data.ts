import type { CategoryKey } from "./categories";

export interface Influencer {
  id: string;
  rank: number;
  username: string;
  category: CategoryKey;
  followers: number;
  following: number;
  posts: number;
  engagement: number; // percent
  similarity: number; // 0-100
  image?: string;
}

export interface Brand {
  id: string;
  name: string;
  industry: string;
  budget: "Low" | "Mid" | "High";
}

export const SELECTED_BRAND: Brand = {
  id: "b1",
  name: "Khaadi",
  industry: "Fashion & Lifestyle",
  budget: "High",
};

export const STATS = [
  { value: 100, suffix: "+", label: "Influencers" },
  { value: 8,   suffix: "",  label: "Categories" },
  { value: 50,   suffix: "+",  label: "Pakistani Brands" },
];

export const formatFollowers = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
};
