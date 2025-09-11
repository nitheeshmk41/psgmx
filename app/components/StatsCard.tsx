import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Code, Trophy } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
}

const getIcon = (title: string) => {
  switch (title) {
    case "Total Students":
      return Users;
    case "Problems Solved":
      return Code;
    case "Weekly Progress":
      return TrendingUp;
    case "Weekly Leader":
      return Trophy;
    default:
      return TrendingUp;
  }
};

const getGradient = (title: string) => {
  switch (title) {
    case "Total Students":
      return "from-blue-500/10 to-blue-600/5 border-blue-500/20";
    case "Problems Solved":
      return "from-green-500/10 to-green-600/5 border-green-500/20";
    case "Weekly Progress":
      return "from-orange-500/10 to-orange-600/5 border-orange-500/20";
    case "Weekly Leader":
      return "from-purple-500/10 to-purple-600/5 border-purple-500/20";
    default:
      return "from-gray-500/10 to-gray-600/5 border-gray-500/20";
  }
};

export default function StatsCard({ title, value }: StatsCardProps) {
  const Icon = getIcon(title);
  const gradientClass = getGradient(title);

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${gradientClass} transition-all duration-200 hover:shadow-md`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </CardContent>
      
      {/* Decorative element */}
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary/5 to-primary/10" />
    </Card>
  );
}