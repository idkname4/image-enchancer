"use client";

import { useState, useReducer, useRef, useEffect, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { getAISuggestions } from "@/lib/actions";
import { processImage } from "@/lib/image-processor";
import { ENHANCEMENT_METHODS } from "@/lib/constants";
import type { ProcessedImage } from "@/lib/definitions";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Upload, Loader2, Sparkles, Trash2, ShieldCheck, Eye } from "lucide-react";
import Image from "next/image";
import EnhancementCard from "./enhancement-card";

type State = {
  originalImage: { src: string; file: File } | null;
  processedImages: ProcessedImage[];
  isProcessing: boolean;
  consentGiven: boolean;
  isConsentModalOpen: boolean;
  useAISuggestions: boolean;
  highlightedImageSrc: string | null;
  focusedImageIndex: number;
};

type Action =
  | { type: "SET_ORIGINAL_IMAGE"; payload: { src: string; file: File } | null }
  | { type: "SET_PROCESSED_IMAGES"; payload: ProcessedImage[] }
  | { type: "SET_IS_PROCESSING"; payload: boolean }
  | { type: "TOGGLE_CONSENT" }
  | { type: "SET_CONSENT_MODAL"; payload: boolean }
  | { type: "TOGGLE_AI_SUGGESTIONS" }
  | { type: "SET_HIGHLIGHTED_IMAGE"; payload: string | null }
  | { type: "SET_FOCUSED_IMAGE_INDEX"; payload: number }
  | { type: "RESET" };

const initialState: State = {
  originalImage: null,
  processedImages: [],
  isProcessing: false,
  consentGiven: false,
  isConsentModalOpen: false,
  useAISuggestions: true,
  highlightedImageSrc: null,
  focusedImageIndex: -1,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ORIGINAL_IMAGE":
      return { ...state, originalImage: action.payload, processedImages: [], focusedImageIndex: -1 };
    case "SET_PROCESSED_IMAGES":
      return { ...state, processedImages: action.payload };
    case "SET_IS_PROCESSING":
      return { ...state, isProcessing: action.payload };
    case "TOGGLE_CONSENT":
      return { ...state, consentGiven: !state.consentGiven };
    case "SET_CONSENT_MODAL":
      return { ...state, isConsentModalOpen: action.payload };
    case "TOGGLE_AI_SUGGESTIONS":
      return { ...state, useAISuggestions: !state.useAISuggestions };
    case "SET_HIGHLIGHTED_IMAGE":
      return { ...state, highlightedImageSrc: action.payload };
    case "SET_FOCUSED_IMAGE_INDEX":
      return { ...state, focusedImageIndex: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function ImageEnhanceClient() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAIPending, startAITransition] = useTransition();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        dispatch({ type: "SET_ORIGINAL_IMAGE", payload: { src: e.target?.result as string, file } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    if (!state.consentGiven) {
      dispatch({ type: "SET_CONSENT_MODAL", payload: true });
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleProceed = () => {
    if (state.consentGiven) {
      dispatch({ type: "SET_CONSENT_MODAL", payload: false });
      fileInputRef.current?.click();
    } else {
      toast({
        title: "Consent Required",
        description: "You must consent to image processing to proceed.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    dispatch({ type: "RESET" });
    if(fileInputRef.current) fileInputRef.current.value = "";
    toast({
      title: "Data Deleted",
      description: "Your uploaded image and all processed results have been deleted.",
    });
  };

  useEffect(() => {
    if (state.originalImage) {
      const runEnhancements = async () => {
        dispatch({ type: "SET_IS_PROCESSING", payload: true });

        const [processedResults, aiSuggestions] = await Promise.all([
          processImage(state.originalImage!.src),
          state.useAISuggestions ? getAISuggestions(state.originalImage!.src) : Promise.resolve([])
        ]);

        const finalImages: ProcessedImage[] = ENHANCEMENT_METHODS.map(method => {
          if (method.id === "original") {
            return {
              id: "original",
              name: "Original",
              src: state.originalImage!.src,
              description: method.description,
              icon: method.icon,
            };
          }
          const result = processedResults.find(r => r.id === method.id);
          const aiSuggestion = aiSuggestions.find(s => s.name.toLowerCase().includes(method.name.toLowerCase()));
          
          return {
            id: method.id,
            name: method.name,
            src: result?.dataUrl || "",
            description: aiSuggestion?.explanation || method.description,
            icon: method.icon,
            isRecommended: !!aiSuggestion
          };
        });

        dispatch({ type: "SET_PROCESSED_IMAGES", payload: finalImages });
        dispatch({ type: "SET_IS_PROCESSING", payload: false });
        dispatch({ type: "SET_FOCUSED_IMAGE_INDEX", payload: 0 });
      };
      
      startAITransition(() => {
        runEnhancements();
      });
    }
  }, [state.originalImage, state.useAISuggestions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if(state.processedImages.length === 0 || state.highlightedImageSrc) return;

        if(e.key === 'ArrowRight') {
            e.preventDefault();
            dispatch({type: 'SET_FOCUSED_IMAGE_INDEX', payload: (state.focusedImageIndex + 1) % state.processedImages.length});
        }
        if(e.key === 'ArrowLeft') {
            e.preventDefault();
            dispatch({type: 'SET_FOCUSED_IMAGE_INDEX', payload: (state.focusedImageIndex - 1 + state.processedImages.length) % state.processedImages.length});
        }
        if(e.key === 'Enter' && state.focusedImageIndex !== -1) {
            e.preventDefault();
            dispatch({type: 'SET_HIGHLIGHTED_IMAGE', payload: state.processedImages[state.focusedImageIndex].src});
        }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.focusedImageIndex, state.processedImages, state.highlightedImageSrc]);

  const isLoading = state.isProcessing || isAIPending;
  
  if (!state.originalImage) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-lg text-center shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Enhance Your Images with AI</CardTitle>
            <CardDescription>Upload a photo to see the magic. Our AI will analyze your image and apply powerful enhancements automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="w-full" onClick={handleUploadClick}>
              <Upload className="mr-2 h-5 w-5" /> Upload Image
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <p className="text-xs text-muted-foreground mt-4">By uploading, you agree to our temporary image processing terms.</p>
          </CardContent>
        </Card>
        <Dialog open={state.isConsentModalOpen} onOpenChange={(isOpen) => dispatch({ type: "SET_CONSENT_MODAL", payload: isOpen })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline">Consent for Image Processing</DialogTitle>
              <DialogDescription>
                To enhance your image, we need to process it on our servers. Your image will be used solely for this purpose.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
               <p>We respect your privacy. Here's what you need to know:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                    <li>Your image is processed to apply enhancements and, optionally, to get AI recommendations.</li>
                    <li>We provide options to delete your data immediately after you're done.</li>
                    <li>Your data is not shared with third parties.</li>
                </ul>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={state.consentGiven} onCheckedChange={() => dispatch({ type: "TOGGLE_CONSENT" })} />
              <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I consent to my image being processed
              </label>
            </div>
            <Button onClick={handleProceed} disabled={!state.consentGiven}>Proceed to Upload</Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold font-headline">Enhancement Results</h1>
        <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
                <Switch id="ai-suggestions" checked={state.useAISuggestions} onCheckedChange={() => dispatch({ type: 'TOGGLE_AI_SUGGESTIONS'})} />
                <Label htmlFor="ai-suggestions" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    Suggest relevant methods
                </Label>
            </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><ShieldCheck className="mr-2 h-4 w-4" /> Privacy Control</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete and Start Over
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading && (
          <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold font-headline">Processing Image...</h2>
              <p className="text-muted-foreground">Applying enhancements and analyzing with AI. Please wait.</p>
          </div>
      )}

      {!isLoading && state.processedImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.processedImages.map((img, index) => (
            <EnhancementCard 
              key={img.id} 
              image={img}
              isFocused={index === state.focusedImageIndex}
              onClick={() => dispatch({type: 'SET_HIGHLIGHTED_IMAGE', payload: img.src})}
            />
          ))}
        </div>
      )}

      <Dialog open={!!state.highlightedImageSrc} onOpenChange={(isOpen) => !isOpen && dispatch({type: 'SET_HIGHLIGHTED_IMAGE', payload: null})}>
          <DialogContent className="max-w-4xl">
              <DialogHeader>
                  <DialogTitle className="font-headline">Image Preview</DialogTitle>
              </DialogHeader>
              {state.highlightedImageSrc && (
                <div className="relative aspect-video">
                  <Image src={state.highlightedImageSrc} alt="Enlarged view" fill style={{objectFit: 'contain'}} />
                </div>
              )}
          </DialogContent>
      </Dialog>
    </div>
  );
}
