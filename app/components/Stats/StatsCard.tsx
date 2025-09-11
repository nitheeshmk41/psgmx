import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, TrendingUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
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

export default function StatsCard({ title, value, subtitle }: StatsCardProps) {
  const Icon = getIcon(title);
  const gradientClass = getGradient(title);

  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br ${gradientClass} transition-all duration-300 hover:shadow-lg rounded-xl border`}
    >
      <CardHeader className="flex justify-between items-center pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>

      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary/5 to-primary/10" />
    </Card>
  );
}
