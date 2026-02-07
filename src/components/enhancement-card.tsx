"use client";
import type { ProcessedImage } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type EnhancementCardProps = {
  image: ProcessedImage;
  isFocused: boolean;
  onClick: () => void;
};

export default function EnhancementCard({ image, isFocused, onClick }: EnhancementCardProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = image.src;
    link.download = `${image.name.toLowerCase().replace(" ", "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const Icon = image.icon;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative group",
        isFocused && "shadow-2xl ring-2 ring-primary ring-offset-2 ring-offset-background",
        image.isRecommended && "border-accent"
      )}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
            onClick();
        }
      }}
    >
      {image.isRecommended && (
        <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full p-1.5 z-10">
          <Sparkles className="h-4 w-4" />
          <span className="sr-only">Recommended by AI</span>
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Icon className="h-5 w-5" />
          {image.name}
        </CardTitle>
        <CardDescription className="text-sm h-16 overflow-auto">{image.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video w-full overflow-hidden rounded-md border">
          <Image
            src={image.src}
            alt={`Image with ${image.name} enhancement`}
            width={400}
            height={225}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {image.name !== "Original" && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleDownload}
            aria-label={`Download ${image.name} image`}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
