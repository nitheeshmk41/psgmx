import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Code, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface GroupStatsProps {
  groupName: string;
  members: number;
  totalSolved: number;
  weeklyProgress: number;
  weeklyTop: string;
  overallTop: string;
  color: string;
}

export default function GroupStats({
  groupName,
  members,
  totalSolved,
  weeklyProgress,
  weeklyTop,
  overallTop,
  color,
}: GroupStatsProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={`${color} border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-gray-100">
            <span>{groupName}</span>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium">
              {members} members
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Code className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <span>Total Solved</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalSolved.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
                <span>This Week</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                +{weeklyProgress}
              </p>
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Trophy className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                <span>Weekly Leader</span>
              </div>
              <Badge className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {weeklyTop}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                <span>Overall Leader</span>
              </div>
              <Badge className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {overallTop}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}