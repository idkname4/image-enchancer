import type { ComponentType } from "react";

export type EnhancementMethod = {
  id: "original" | "grayscale" | "low-pass" | "gamma" | "histogram";
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export type ProcessedImage = {
  id: string;
  name:string;
  src: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  isRecommended?: boolean;
};
