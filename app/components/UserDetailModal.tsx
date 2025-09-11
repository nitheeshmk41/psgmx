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
  BookOpen
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

// Mock refresh function for demonstration
const refreshUser = async (userData: any) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    ...userData,
    totalsolved: userData.totalsolved + Math.floor(Math.random() * 5),
    weekly_solved: Math.floor(Math.random() * 20),
    last_active: new Date().toISOString()
  };
};

// Sample user data for demonstration
const sampleUser = {
  username: "CodeMaster2024",
  profileimg: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
  class: "Computer Science",
  roll_num: "CS21B1234",
  totalsolved: 287,
  easy_solved: 145,
  medium_solved: 98,
  hard_solved: 44,
  recent_languages: ["Python", "JavaScript", "Java", "C++"],
  weekly_solved: 12,
  last_active: "2025-09-10T14:30:00Z"
};

const StatCard = ({ icon: Icon, label, value, className = "" }: any) => (
  <Card className={`hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${className}`}>
    <CardContent className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const LoadingSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <Skeleton className="w-24 h-24 rounded-full" />
      <div className="space-y-3 flex-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
    <Skeleton className="h-80 w-full" />
  </div>
);

export default function UserDetailModal({ user = sampleUser, children }: any) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(user);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const updated = await refreshUser(data);
      setData(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const DIFFICULTY_COLORS = {
    Easy: "#22c55e",
    Medium: "#f59e0b", 
    Hard: "#ef4444"
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
        year: "numeric"
      })
    : "Never";

  const pieData = [
    { name: "Easy", value: solved.easy, color: DIFFICULTY_COLORS.Easy },
    { name: "Medium", value: solved.medium, color: DIFFICULTY_COLORS.Medium },
    { name: "Hard", value: solved.hard, color: DIFFICULTY_COLORS.Hard },
  ].filter(item => item.value > 0); // Filter out zero values for better visualization

  const barData = [
    { difficulty: "Easy", solved: solved.easy, color: DIFFICULTY_COLORS.Easy },
    { difficulty: "Medium", solved: solved.medium, color: DIFFICULTY_COLORS.Medium },
    { difficulty: "Hard", solved: solved.hard, color: DIFFICULTY_COLORS.Hard },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <User className="h-4 w-4" />
            View Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-0 rounded-xl shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-gradient-to-br from-background via-background to-muted/20"
        >
          <DialogHeader className="px-6 py-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm">
            <DialogTitle className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 ring-1 ring-primary/20">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">User Profile</h2>
                  <p className="text-sm text-muted-foreground">Detailed coding journey overview</p>
                </div>
              </div>
              <Button
                onClick={handleRefresh}
                size="sm"
                variant="outline"
                disabled={loading}
                className="gap-2 hover:bg-primary/5 transition-all duration-200"
              >
                <RefreshCw className={`${loading ? "animate-spin" : ""} h-4 w-4`} />
                Refresh Data
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 sm:p-6 space-y-8">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Profile Header */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col sm:flex-row items-center sm:items-start gap-6"
                >
                  <div className="relative group">
                    <Avatar className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-primary/10 transition-all duration-300 group-hover:ring-primary/20 group-hover:shadow-xl">
                      <AvatarImage src={data.profileimg} className="object-cover" />
                      <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
                        {data.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-green-500/90 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center animate-pulse">
                      <Activity className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
                      {data.username}
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {data.class && (
                        <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
                          <BookOpen className="h-3 w-3" />
                          {data.class}
                        </Badge>
                      )}
                      {data.roll_num && (
                        <Badge variant="outline" className="gap-1 px-3 py-1 text-sm">
                          <User className="h-3 w-3" />
                          {data.roll_num}
                        </Badge>
                      )}
                      <Badge variant="default" className="gap-1 px-3 py-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        Active on {lastActiveFormatted}
                      </Badge>
                    </div>
                    
                    {data.recent_languages && data.recent_languages.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center sm:justify-start mt-3">
                        {data.recent_languages.map((lang: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs gap-1 px-2 py-1">
                            <Code className="h-3 w-3" />
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                <Separator className="my-4" />

                {/* Stats Grid */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <StatCard
                    icon={Trophy}
                    label="Total Solved"
                    value={data.totalsolved || 0}
                    className="lg:col-span-1 bg-gradient-to-br from-primary/5 to-primary/10"
                  />
                  <StatCard
                    icon={Target}
                    label="Easy Problems"
                    value={solved.easy}
                    className="border-green-100 bg-green-50/30"
                  />
                  <StatCard
                    icon={Award}
                    label="Medium Problems"
                    value={solved.medium}
                    className="border-yellow-100 bg-yellow-50/30"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Hard Problems"
                    value={solved.hard}
                    className="border-red-100 bg-red-50/30"
                  />
                </motion.div>

                {/* Charts Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Pie Chart */}
                  <Card className="shadow-md overflow-hidden border border-border/50">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Problem Distribution
                      </h4>
                      <div className="h-64 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={3}
                              
                              labelLine={false}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} strokeWidth={2} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                                padding: "8px 12px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                              }}
                            />
                            <Legend 
                              wrapperStyle={{ 
                                paddingTop: "16px",
                                fontSize: "0.875rem"
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bar Chart */}
                  <Card className="shadow-md overflow-hidden border border-border/50">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Difficulty Breakdown
                      </h4>
                      <div className="h-64 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                            <XAxis dataKey="difficulty" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                                padding: "8px 12px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                              }}
                            />
                            <Bar dataKey="solved" radius={[8, 8, 0, 0]}>
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10 shadow-md overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-primary/10 ring-1 ring-primary/20">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold">Weekly Progress</h4>
                            <p className="text-muted-foreground text-sm">Your coding momentum this week</p>
                          </div>
                        </div>
                        <div className="text-right w-full sm:w-auto">
                          <p className="text-4xl font-bold text-primary">{data.weekly_solved || 0}</p>
                          <p className="text-sm text-muted-foreground">Problems Solved</p>
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