import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface LeaderboardCardProps {
  user: any;
  refreshing: boolean;
  refreshUser: (user: any) => void;
}

export default function LeaderboardCard({
  user,
  refreshing,
  refreshUser,
}: LeaderboardCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-gray-100">
            <span>{user.username}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({user.roll_num})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          <div className="flex justify-center">
            <img
              src={user.profileimg || "/placeholder.png"}
              alt={user.username}
              className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover"
            />
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Class:</span> {user.class}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Total Solved:</span> {user.totalsolved}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Weekly Solved:</span> {user.weekly_solved}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Difficulty:</span>{" "}
              Easy: {user.easy_solved} | Medium: {user.medium_solved} | Hard: {user.hard_solved}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Last Active:</span> {user.last_active || "-"}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Top Languages:</span>{" "}
              {user.recent_languages?.join(", ") || "-"}
            </p>
          </div>
          <Button
            onClick={() => refreshUser(user)}
            disabled={refreshing}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}