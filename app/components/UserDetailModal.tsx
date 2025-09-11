import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  Trophy, 
  Award, 
  Code2, 
  X, 
  Calendar,
  TrendingUp,
  Target,
  Star,
  ExternalLink,
  User,
  BarChart3,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  weeklyRank?: number;
  overallRank?: number;
  isWeeklyTop?: boolean;
  isOverallTop?: boolean;
}

interface LeetCodeData {
  username: string;
  realName: string;
  avatar: string;
  overallRank: number;
  totalSubmissions: number;
  acceptanceRate: string;
  mostUsedLanguage: string;
  totalActiveDays: number;
  solved: {
    easy: number;
    medium: number;
    hard: number;
  };
  potd: {
    date: string;
    link: string;
    title: string;
    difficulty: string;
  } | null;
}

interface UserDetailModalProps {
  user: User;
  children: React.ReactNode;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress bars */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="mx-auto max-w-sm">
        <Award className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load details</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Unable to fetch LeetCode data. Please try again.
        </p>
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  gradient = false,
  className = ""
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  gradient?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={cn(
            "p-2 rounded-lg",
            gradient ? "bg-gradient-to-br from-primary to-primary/60" : "bg-muted"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              gradient ? "text-primary-foreground" : "text-muted-foreground"
            )} />
          </div>
        </div>
      </CardContent>
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
      )}
    </Card>
  );
}

function DifficultyProgress({ 
  label, 
  count, 
  total, 
  color,
  bgColor 
}: { 
  label: string; 
  count: number; 
  total: number; 
  color: string;
  bgColor: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={cn("w-3 h-3 rounded-full", bgColor)} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold">{count}</span>
          <span className="text-xs text-muted-foreground">/ {total}</span>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={cn("h-2 rounded-full transition-all duration-500", color)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-right">
        <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}

export default function UserDetailModal({ user, children }: UserDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchLeetCodeData = async () => {
    if (!user.leetcode_id) return;
    
    setLoading(true);
    setError(false);
    
    try {
      const response = await fetch(`/api/leetcode/${user.leetcode_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setLeetcodeData(data);
    } catch (err) {
      setError(true);
      console.error('Error fetching LeetCode data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user.leetcode_id && !leetcodeData && !loading) {
      fetchLeetCodeData();
    }
  }, [isOpen, user.leetcode_id]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when closing
      setLeetcodeData(null);
      setError(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getTotalSolved = () => {
    if (!leetcodeData) return user.totalsolved || 0;
    return leetcodeData.solved.easy + leetcodeData.solved.medium + leetcodeData.solved.hard;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Details</span>
          </DialogTitle>
        </DialogHeader>

        {!user.leetcode_id ? (
          <div className="text-center py-8">
            <Award className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No LeetCode ID</h3>
            <p className="text-sm text-muted-foreground">
              This user hasn't linked their LeetCode account yet.
            </p>
          </div>
        ) : loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState onRetry={fetchLeetCodeData} />
        ) : (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-6 rounded-lg bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border">
              <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                <AvatarImage 
                  src={leetcodeData?.avatar || user.profileimg || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                  {leetcodeData?.realName && (
                    <span className="text-muted-foreground">({leetcodeData.realName})</span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={user.class === "G1" ? "default" : "secondary"}>
                    {user.class}
                  </Badge>
                  <Badge variant="outline">{user.roll_num}</Badge>
                  {user.weeklyRank && user.weeklyRank <= 3 && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
                      {user.weeklyRank === 1 ? "🥇" : user.weeklyRank === 2 ? "🥈" : "🥉"} 
                      Weekly #{user.weeklyRank}
                    </Badge>
                  )}
                </div>

                {user.leetcode_id && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`https://leetcode.com/${user.leetcode_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Visit LeetCode Profile
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Solved"
                value={getTotalSolved()}
                icon={Trophy}
                gradient
                className="col-span-1 sm:col-span-2 lg:col-span-1"
              />
              <StatCard
                title="Weekly Solved"
                value={user.weekly_solved || 0}
                icon={Code2}
              />
              <StatCard
                title="Global Rank"
                value={leetcodeData?.overallRank ? `#${leetcodeData.overallRank.toLocaleString()}` : 'N/A'}
                icon={TrendingUp}
              />
              <StatCard
                title="Acceptance Rate"
                value={leetcodeData?.acceptanceRate || 'N/A'}
                icon={Target}
              />
            </div>

            {leetcodeData && (
              <>
                {/* Additional Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard
                    title="Total Submissions"
                    value={leetcodeData.totalSubmissions.toLocaleString()}
                    icon={BarChart3}
                  />
                  <StatCard
                    title="Active Days"
                    value={leetcodeData.totalActiveDays}
                    icon={Calendar}
                  />
                  <StatCard
                    title="Main Language"
                    value={leetcodeData.mostUsedLanguage}
                    icon={Code2}
                  />
                </div>

                {/* Problem Solving Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Flame className="h-5 w-5" />
                      <span>Problem Solving Breakdown</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <DifficultyProgress
                      label="Easy"
                      count={leetcodeData.solved.easy}
                      total={Math.max(leetcodeData.solved.easy, 100)}
                      color="bg-gradient-to-r from-green-400 to-green-600"
                      bgColor="bg-green-100"
                    />
                    <DifficultyProgress
                      label="Medium"
                      count={leetcodeData.solved.medium}
                      total={Math.max(leetcodeData.solved.medium, 50)}
                      color="bg-gradient-to-r from-yellow-400 to-yellow-600"
                      bgColor="bg-yellow-100"
                    />
                    <DifficultyProgress
                      label="Hard"
                      count={leetcodeData.solved.hard}
                      total={Math.max(leetcodeData.solved.hard, 25)}
                      color="bg-gradient-to-r from-red-400 to-red-600"
                      bgColor="bg-red-100"
                    />
                  </CardContent>
                </Card>

                {/* Problem of the Day */}
                {leetcodeData.potd && (
                  <Card className="border-2 border-dashed border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-primary">
                        <Star className="h-5 w-5" />
                        <span>Today's Challenge</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{leetcodeData.potd.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={getDifficultyColor(leetcodeData.potd.difficulty)}
                            >
                              {leetcodeData.potd.difficulty}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(leetcodeData.potd.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button asChild>
                          <a 
                            href={leetcodeData.potd.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Solve Now
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}