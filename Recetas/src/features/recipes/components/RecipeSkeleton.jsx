import React from "react";
import { Skeleton } from "@heroui/react";
import { Heart, MapPin, Bookmark } from "lucide-react";

export default function RecipeSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Upper Zone (Multimedia) */}
      <div className="relative h-56 shrink-0 overflow-hidden w-full">
        <Skeleton className="w-full h-full rounded-none" />
        
        {/* Floating Country Badge Fake */}
        <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-black/40 border border-white/20">
          <MapPin className="w-3.5 h-3.5 text-white/50" />
          <Skeleton className="w-16 h-3 rounded-full bg-white/30" />
        </div>

        {/* Floating Save Badge Fake */}
        <div className="absolute top-4 right-4 z-30">
          <div className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md bg-black/40 border border-white/20">
            <Bookmark className="w-5 h-5 text-white/50" />
          </div>
        </div>
      </div>

      {/* Middle Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <Skeleton className="w-3/4 h-6 rounded-lg" />
        <div className="space-y-2 mt-1">
          <Skeleton className="w-full h-3 rounded-lg" />
          <Skeleton className="w-5/6 h-3 rounded-lg" />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 mt-auto">
        {/* Left: Flame Icons Fake */}
        <div className="flex items-center gap-2">
          {/* Fakes the FireContainer space */}
          <Skeleton className="w-20 h-5 rounded-md" />
          <Skeleton className="w-12 h-3 rounded-full" />
        </div>

        {/* Right: Red Heart Icon Fake */}
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          <Skeleton className="w-4 h-4 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
