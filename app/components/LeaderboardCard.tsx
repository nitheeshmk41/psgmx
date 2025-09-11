"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { refreshUser } from "@/lib/refreshUser";

interface LeaderboardCardProps {
  user: any;
}

export default function LeaderboardCard({ user }: LeaderboardCardProps) {
  const [loading, setLoading] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  async function handleRefresh() {
    setLoading(true);
    try {
      const updated = await refreshUser(localUser);
      setLocalUser(updated);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
        <CardHeader>
          <CardTitle className="flex justify-between">
            {localUser.username} ({localUser.roll_num})
            <Button
              size="icon"
              variant="ghost"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "⟳"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-center">
            <img
              src={localUser.profileimg || "/placeholder.png"}
              className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover"
            />
          </div>
          <p>Total Solved: {localUser.totalsolved}</p>
          <p>Weekly Solved: {localUser.weekly_solved}</p>
          <p>
            Difficulty: Easy: {localUser.easy_solved ?? "-"} | Medium:{" "}
            {localUser.medium_solved ?? "-"} | Hard:{" "}
            {localUser.hard_solved ?? "-"}
          </p>
          <p>Top Languages: {localUser.recent_languages?.join(", ") || "-"}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
