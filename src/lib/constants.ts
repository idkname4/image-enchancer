import type { EnhancementMethod } from "@/lib/definitions";
import { Contrast, BarChartHorizontalBig, Image as ImageIcon } from "lucide-react";
import { GrayscaleIcon } from "@/components/icons/grayscale-icon";
import { BlurIcon } from "@/components/icons/blur-icon";

export const ENHANCEMENT_METHODS: EnhancementMethod[] = [
  {
    id: "original",
    name: "Original",
    description: "The original, unprocessed image uploaded by the user.",
    icon: ImageIcon,
  },
  {
    id: "grayscale",
    name: "Grayscale",
    description:
      "Converts the image to shades of gray, removing all color information. Useful for focusing on texture and luminance.",
    icon: GrayscaleIcon,
  },
  {
    id: "low-pass",
    name: "Low-pass",
    description:
      "Applies a blur filter to smoothen the image and reduce noise by averaging pixel values in a neighborhood.",
    icon: BlurIcon,
  },
  {
    id: "gamma",
    name: "Gamma",
    description:
      "Adjusts the image's brightness and contrast by applying a non-linear transformation to the pixel values.",
    icon: Contrast,
  },
  {
    id: "histogram",
    name: "Histogram",
    description:
      "Redistributes pixel intensities to enhance global contrast by spreading out the most frequent intensity values.",
    icon: BarChartHorizontalBig,
  },
];
