import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/app/components/Navbar";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl pt-24">
        {/* Hero Section Skeleton */}
        <section className="relative flex flex-col items-center justify-center space-y-8 text-center pt-8 pb-8 overflow-hidden rounded-3xl bg-transparent">
          <div className="relative z-10 space-y-4 px-4 flex flex-col items-center w-full">
            {/* Live Leaderboard Pill */}
            <Skeleton className="h-8 w-40 rounded-full" />

            {/* Title */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 w-full max-w-4xl py-4">
              <Skeleton className="h-16 w-32 md:w-48" />
              <Skeleton className="h-16 w-32 md:w-48" />
              <Skeleton className="h-16 w-40 md:w-64" />
            </div>
            
            {/* Subtitle */}
            <div className="space-y-2 w-full max-w-2xl">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
            </div>
          </div>

          {/* POTD Banner Skeleton */}
          <div className="relative z-10 w-full max-w-3xl px-4">
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </section>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>

        {/* Group Comparison Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>

        {/* User Grid Skeleton */}
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-32" />
             </div>
             
             <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
             </div>
        </div>
      </main>
    </div>
  );
}
