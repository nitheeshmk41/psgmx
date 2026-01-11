import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, TrendingUp, Hand } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  isFlip?: boolean;
}

const getIcon = (title: string) => {
  switch (title) {
    case "Total Students":
      return Users;
    case "Weekly Progress":
      return TrendingUp;
    case "Weekly Leader":
      return Trophy;
    case "Overall Leader":
      return Trophy;
    default:
      return Users;
  }
};

const getGradient = (title: string) => {
  switch (title) {
    case "Total Students":
      return "from-blue-500/10 to-blue-600/5 border-blue-500/20";
    case "Weekly Progress":
      return "from-green-500/10 to-green-600/5 border-green-500/20";
    case "Weekly Leader":
      return "from-purple-500/10 to-purple-600/5 border-purple-500/20";
    case "Overall Leader":
      return "from-yellow-500/10 to-yellow-600/5 border-yellow-500/20";
    default:
      return "from-gray-500/10 to-gray-600/5 border-gray-500/20";
  }
};

export default function StatsCard({ title, value, subtitle, isFlip }: StatsCardProps) {
  const Icon = getIcon(title);
  const gradientClass = getGradient(title);

  const CardContentInner = () => (
    <>
      <CardHeader className="flex justify-between items-center pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary/5 to-primary/10" />
    </>
  );

  if (!isFlip) {
    return (
      <Card
        className={`relative overflow-hidden bg-gradient-to-br ${gradientClass} transition-all duration-300 hover:shadow-lg rounded-xl border`}
      >
        <CardContentInner />
      </Card>
    );
  }

  // Flip Card Implementation
  return (
    <div className="group h-[160px] [perspective:1000px]">
      <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        
        {/* Front Face */}
        <div className={cn(
            "absolute inset-0 [backface-visibility:hidden] rounded-xl border",
            "flex flex-col items-center justify-center text-center p-6",
            "bg-gradient-to-br shadow-inner", gradientClass
        )}>
           <Icon className="h-10 w-10 mb-3 text-primary/80" />
           <h3 className="text-lg font-bold leading-tight">{title}</h3>
           
           <div className="absolute bottom-3 right-3 opacity-60 animate-pulse">
              <Hand className="w-5 h-5 text-muted-foreground rotate-12" />
           </div>
        </div>

        {/* Back Face */}
        <div className={cn(
            "absolute inset-0 [backface-visibility:hidden] rounded-xl border [transform:rotateY(180deg)]",
            "bg-gradient-to-br from-background to-secondary/30 flex flex-col justify-center", // Added flex centering
            gradientClass
        )}>
            <div className="p-4 flex flex-col items-center justify-center h-full text-center">
                 <div className="text-3xl font-extrabold tracking-tight text-primary break-all line-clamp-2">
                    {value}
                 </div>
                 {subtitle && (
                  <p className="text-xs text-muted-foreground mt-2 font-medium bg-secondary/50 px-2 py-1 rounded-full">
                    {subtitle}
                  </p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
