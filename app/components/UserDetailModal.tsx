"use client";
import React, { useState, useEffect, useMemo } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
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

import { motion } from "framer-motion";
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
  easy_solved?: number;
  medium_solved?: number;
  hard_solved?: number;
  recent_languages?: string[];
}

interface UserDetailModalProps {
  user: User;
  children?: React.ReactNode;
}

// Heatmap Component
const ContributionHeatmap = ({ submissionCalendar }: { submissionCalendar: Record<string, number> }) => {
  const { weeks, maxCount } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // Adjust to start from Sunday
    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const weeks: { date: Date; count: number }[][] = [];
    let currentWeek: { date: Date; count: number }[] = [];
    let maxCount = 0;
    
    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      // Create UTC midnight timestamp to match LeetCode's format
      const utcDate = new Date(Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        0, 0, 0, 0
      ));
      const timestamp = Math.floor(utcDate.getTime() / 1000).toString();
      const count = submissionCalendar[timestamp] || 0;
      maxCount = Math.max(maxCount, count);
      
      currentWeek.push({ date: new Date(currentDate), count });
      
      if (currentDate.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return { weeks, maxCount };
  }, [submissionCalendar]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/50 dark:bg-muted/30";
    if (maxCount === 0) return "bg-muted/50 dark:bg-muted/30";
    
    const intensity = count / maxCount;
    if (intensity <= 0.25) return "bg-green-200 dark:bg-green-900";
    if (intensity <= 0.5) return "bg-green-400 dark:bg-green-700";
    if (intensity <= 0.75) return "bg-green-500 dark:bg-green-600";
    return "bg-green-600 dark:bg-green-500";
  };

  const months = useMemo(() => {
    const monthLabels: { name: string; index: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0]?.date;
      if (firstDayOfWeek) {
        const month = firstDayOfWeek.getMonth();
        if (month !== lastMonth) {
          monthLabels.push({
            name: firstDayOfWeek.toLocaleDateString("en-US", { month: "short" }),
            index: weekIndex,
          });
          lastMonth = month;
        }
      }
    });
    
    return monthLabels;
  }, [weeks]);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {months.map((month, i) => (
            <div
              key={i}
              className="text-xs text-muted-foreground"
              style={{ marginLeft: i === 0 ? 0 : `${(month.index - (months[i - 1]?.index || 0)) * 12 - 24}px` }}
            >
              {month.name}
            </div>
          ))}
        </div>
        
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col justify-around mr-2 text-xs text-muted-foreground">
            {dayLabels.filter((_, i) => i % 2 === 1).map((day) => (
              <span key={day} className="h-[10px] leading-[10px]">{day}</span>
            ))}
          </div>
          
          {/* Heatmap grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = week.find((d) => d.date.getDay() === dayIndex);
                  if (!day) {
                    return <div key={dayIndex} className="w-[10px] h-[10px]" />;
                  }
                  return (
                    <TooltipProvider key={dayIndex} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-[10px] h-[10px] rounded-[2px] cursor-pointer transition-all hover:ring-1 hover:ring-primary",
                              getColor(day.count)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">
                            {day.count} submission{day.count !== 1 ? "s" : ""} on{" "}
                            {day.date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-[3px]">
            <div className="w-[10px] h-[10px] rounded-[2px] bg-muted/50 dark:bg-muted/30" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-green-200 dark:bg-green-900" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-green-400 dark:bg-green-700" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-green-500 dark:bg-green-600" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-green-600 dark:bg-green-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

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

export default function UserDetailModal({ user, children }: UserDetailModalProps) {
  const [data] = useState<User>(user);
  const [submissionCalendar, setSubmissionCalendar] = useState<Record<string, number>>({});
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch submission calendar when modal opens
  useEffect(() => {
    if (isOpen && data.leetcode_id && Object.keys(submissionCalendar).length === 0) {
      setIsLoadingCalendar(true);
      fetch(`/api/user/${data.leetcode_id}/calendar`)
        .then((res) => res.json())
        .then((json) => {
          if (json.submissionCalendar) {
            setSubmissionCalendar(json.submissionCalendar);
          }
        })
        .catch((err) => console.error("Failed to fetch calendar:", err))
        .finally(() => setIsLoadingCalendar(false));
    }
  }, [isOpen, data.leetcode_id, submissionCalendar]);

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          w-[95vw] max-w-[1000px] sm:max-w-[1200px] lg:max-w-[1400px]
          h-[85vh] mx-auto
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
          className="flex flex-col h-full"
        >
          <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/20">
            <DialogTitle className="flex items-center gap-2 sm:gap-3">
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
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6"
            >
              <div className="relative group">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-primary/10 rounded-full">
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
                    <Badge variant="secondary" className="gap-1 px-3 py-1 text-xs sm:text-sm rounded-md">
                      <BookOpen className="h-4 w-4" />
                      {data.class}
                    </Badge>
                  )}
                  {data.roll_num && (
                    <Badge variant="outline" className="gap-1 px-3 py-1 text-xs sm:text-sm rounded-md">
                      <User className="h-4 w-4" />
                      {data.roll_num}
                    </Badge>
                  )}
                  <Badge variant="default" className="gap-1 px-3 py-1 text-xs sm:text-sm rounded-md">
                    <Calendar className="h-4 w-4" />
                    Active on {lastActiveFormatted}
                  </Badge>
                  {data.leetcode_id && (
                    <Badge variant="default" className="gap-1 px-3 py-1 text-xs sm:text-sm rounded-md">
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
                      <Badge key={index} variant="outline" className="text-xs sm:text-sm gap-1 px-2.5 py-1 rounded-md">
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
              <StatCard icon={Trophy} label="Total Solved" value={data.totalsolved || 0} className="bg-gradient-to-br from-primary/10 to-primary/20" />
              <StatCard icon={Target} label="Easy" value={solved.easy} className="border-green-100 bg-green-50/30 dark:bg-green-900/30" />
              <StatCard icon={Award} label="Medium" value={solved.medium} className="border-yellow-100 bg-yellow-50/30 dark:bg-yellow-900/30" />
              <StatCard icon={TrendingUp} label="Hard" value={solved.hard} className="border-red-100 bg-red-50/30 dark:bg-red-900/30" />
            </motion.div>
            {/* Contribution Heatmap */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="shadow-md border border-border/20 rounded-xl">
                <CardContent className="p-3 sm:p-4">
                  <h4 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-1.5 sm:gap-2">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Submission Activity
                  </h4>
                  {isLoadingCalendar ? (
                    <div className="h-36 sm:h-40 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : Object.keys(submissionCalendar).length > 0 ? (
                    <ContributionHeatmap submissionCalendar={submissionCalendar} />
                  ) : (
                    <div className="h-36 sm:h-40 flex items-center justify-center text-muted-foreground">
                      No submission data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            {/* Weekly Progress */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
