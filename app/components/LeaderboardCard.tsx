"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { refreshUser as refreshUserLib, User } from "@/lib/refreshUser";
import Image from "next/image";

interface LeaderboardCardProps {
  user: User;
  refreshing?: boolean;
  refreshUser?: (user: User) => Promise<User>;
}

export default function LeaderboardCard({
  user,
  refreshing = false,
  refreshUser,
}: LeaderboardCardProps) {
  const [loading, setLoading] = useState(refreshing);
  const [localUser, setLocalUser] = useState<User>(user);

  useEffect(() => {
    setLoading(refreshing);
  }, [refreshing]);

  async function handleRefresh() {
    if (!refreshUser) return;
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
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {localUser.username} ({localUser.roll_num})
            <Button size="icon" variant="ghost" onClick={handleRefresh} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "⟳"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-center">
            <Image
              alt="Profile Image"
              src={localUser.profileimg || "/placeholder.png"}
              width={80}
              height={80}
              className="rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover"
            />
          </div>
          <p>Total Solved: {localUser.totalsolved}</p>
          <p>Weekly Solved: {localUser.weekly_solved}</p>
          <p>
            Difficulty: Easy: {localUser.easy_solved ?? "-"} | Medium: {localUser.medium_solved ?? "-"} | Hard: {localUser.hard_solved ?? "-"}
          </p>
          <p>Top Languages: {localUser.recent_languages?.join(", ") || "-"}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
