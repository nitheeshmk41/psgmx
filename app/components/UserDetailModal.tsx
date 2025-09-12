"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw,
  Calendar,
  User,
  Trophy,
  Target,
  Code,
  Activity,
  TrendingUp,
  Award,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  username: string;
  roll_num: string;
  class: "G1" | "G2";
  totalsolved: number;
  weekly_solved: number;
  leetcode_id?: string;
  profileimg?: string;
  last_active?: string;
  ranking?: number;
  weeklyRank?: number;
  overallRank?: number;
  easy_solved?: number;
  medium_solved?: number;
  hard_solved?: number;
  recent_languages?: string[];
}

interface UserDetailModalProps {
  user: User;
  children?: React.ReactNode;
}

const StatCard = ({ icon: Icon, label, value, className = "" }: any) => (
  <Card
    className={cn(
      "hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-border/20 bg-gradient-to-br from-background to-background/90 rounded-xl",
      className
    )}
  >
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="p-2 rounded-md bg-primary/10">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-lg sm:text-xl font-bold">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const LoadingSkeleton = () => (
  <div className="space-y-4 p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
      <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-32 sm:w-40" />
        <Skeleton className="h-4 w-24 sm:w-28" />
        <Skeleton className="h-4 w-28 sm:w-32" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
    <Skeleton className="h-40 w-full" />
  </div>
);

export default function UserDetailModal({ user, children }: UserDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User>(user);

  const handleRefresh = async () => {
    if (!data.leetcode_id) {
      toast.error("No LeetCode ID available");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${data.leetcode_id}`);
      if (!response.ok) throw new Error("Failed to refresh user data");
      const updatedUser = await response.json();
      setData(updatedUser);
      toast.success(`${data.username}'s data refreshed successfully`);
    } catch {
      toast.error(`Failed to refresh ${data.username}'s data`);
    } finally {
      setLoading(false);
    }
  };

  const DIFFICULTY_COLORS = {
    Easy: "#22c55e",
    Medium: "#f59e0b",
    Hard: "#ef4444",
  };

  const solved = {
    easy: data.easy_solved ?? 0,
    medium: data.medium_solved ?? 0,
    hard: data.hard_solved ?? 0,
  };

  const lastActiveFormatted = data.last_active
    ? new Date(data.last_active).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Never";

  const barData = [
    { difficulty: "Easy", solved: solved.easy, color: DIFFICULTY_COLORS.Easy },
    { difficulty: "Medium", solved: solved.medium, color: DIFFICULTY_COLORS.Medium },
    { difficulty: "Hard", solved: solved.hard, color: DIFFICULTY_COLORS.Hard },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            className="gap-2 hover:bg-primary/10 transition-all duration-200 rounded-lg text-sm sm:text-base"
          >
            <User className="h-4 w-4" />
            View Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="
          w-[95vw] max-w-[1000px] sm:max-w-[1200px] lg:max-w-[1400px] /* Ultra wide */
          h-auto max-h-[85vh] /* Compact height */
          mx-auto
          p-0 rounded-2xl shadow-2xl border border-border/20
          bg-background/95 backdrop-blur-md
          flex flex-col
          overflow-hidden
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          animate-in fade-in-50 zoom-in-95
        "
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-background/95"
        >
          <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/20">
            <DialogTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                    User Profile
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Explore coding achievements
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRefresh}
                size="sm"
                variant="outline"
                disabled={loading}
                className="gap-2 hover:bg-primary/10 transition-all duration-200 rounded-lg text-xs sm:text-sm"
              >
                <RefreshCw
                  className={cn("h-4 w-4", loading && "animate-spin")}
                />
                Refresh
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Profile Header */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6"
                >
                  <div className="relative group">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-primary/10 transition-all duration-300 group-hover:ring-primary/30 rounded-full">
                      <AvatarImage src={data.profileimg} className="object-cover" />
                      <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
                        {data.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-green-500/90 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center">
                      <Activity className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
                      {data.username}
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {data.class && (
                        <Badge
                          variant="secondary"
                          className="gap-1 px-3 py-1 text-xs sm:text-sm rounded-md"
                        >
                          <BookOpen className="h-4 w-4" />
                          {data.class}
                        </Badge>
                      )}
                      {data.roll_num && (
                        <Badge
                          variant="outline"
                          className="gap-1 px-3 py-1 text-xs sm:text-sm rounded-md"
                        >
                          <User className="h-4 w-4" />
                          {data.roll_num}
                        </Badge>
                      )}
                      <Badge
                        variant="default"
                        className="gap-1 px-3 py-1 text-xs sm:text-sm rounded-md"
                      >
                        <Calendar className="h-4 w-4" />
                        Active on {lastActiveFormatted}
                      </Badge>
                      {data.leetcode_id && (
                        <Badge
                          variant="default"
                          className="gap-1 px-3 py-1 text-xs sm:text-sm rounded-md"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <a
                            href={`https://leetcode.com/${data.leetcode_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            LeetCode
                          </a>
                        </Badge>
                      )}
                    </div>
                    {data.recent_languages && data.recent_languages.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                        {data.recent_languages.map((lang, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs sm:text-sm gap-1 px-2.5 py-1 rounded-md"
                          >
                            <Code className="h-4 w-4" />
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
                <Separator className="my-3 sm:my-4" />
                {/* Stats Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
                >
                  <StatCard
                    icon={Trophy}
                    label="Total Solved"
                    value={data.totalsolved || 0}
                    className="bg-gradient-to-br from-primary/10 to-primary/20"
                  />
                  <StatCard
                    icon={Target}
                    label="Easy"
                    value={solved.easy}
                    className="border-green-100 bg-green-50/30 dark:bg-green-900/30"
                  />
                  <StatCard
                    icon={Award}
                    label="Medium"
                    value={solved.medium}
                    className="border-yellow-100 bg-yellow-50/30 dark:bg-yellow-900/30"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Hard"
                    value={solved.hard}
                    className="border-red-100 bg-red-50/30 dark:bg-red-900/30"
                  />
                </motion.div>
                {/* Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="shadow-md border border-border/20 rounded-xl">
                    <CardContent className="p-3 sm:p-4">
                      <h4 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-1.5 sm:gap-2">
                        <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Difficulty Breakdown
                      </h4>
                      <div className="h-36 sm:h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={barData}
                            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="difficulty" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                                padding: "6px 10px",
                                fontSize: "12px",
                              }}
                            />
                            <Bar dataKey="solved" radius={[6, 6, 0, 0]}>
                              {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                {/* Weekly Progress */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10 shadow-md rounded-xl">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-semibold">
                              Weekly Progress
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Your coding momentum this week
                            </p>
                          </div>
                        </div>
                        <div className="text-right w-full sm:w-auto">
                          <p className="text-xl sm:text-2xl font-bold text-primary">
                            {data.weekly_solved || 0}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Problems Solved
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}