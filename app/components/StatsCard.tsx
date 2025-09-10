import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

export default function StatsCard({
  title,
  value,
  description,
  icon,
}: StatsCardProps) {
  return (
    <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-700 shadow-lg rounded-xl hover:shadow-2xl transition p-4">
      <CardContent className="flex flex-col items-center gap-2">
        {icon && <div className="text-2xl text-blue-400">{icon}</div>}
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
        {description && <p className="text-gray-500 text-sm">{description}</p>}
      </CardContent>
    </Card>
  );
}
