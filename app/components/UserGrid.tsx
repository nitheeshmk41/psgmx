"use client";

import React, { useState } from "react";
import { Trophy, Code2, RefreshCw, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import UserDetailModal from "./UserDetailModal";

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
}

interface UserGridProps {
  users: User[];
  refreshingIds: number[];
  onRefreshUser: (user: User) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
}

// Compute ranks with tie-handling
function computeRanks(users: User[]) {
  // Weekly rank
  const weeklySorted = [...users].sort(
    (a, b) => b.weekly_solved - a.weekly_solved
  );
  let currentRank = 1;
  weeklySorted.forEach((user, idx) => {
    if (idx > 0 && user.weekly_solved === weeklySorted[idx - 1].weekly_solved) {
      user.weeklyRank = weeklySorted[idx - 1].weeklyRank;
    } else {
      user.weeklyRank = currentRank;
    }
    currentRank++;
  });

  // Overall rank
  const overallSorted = [...users].sort(
    (a, b) => b.totalsolved - a.totalsolved
  );
  currentRank = 1;
  overallSorted.forEach((user, idx) => {
    if (idx > 0 && user.totalsolved === overallSorted[idx - 1].totalsolved) {
      user.overallRank = overallSorted[idx - 1].overallRank;
    } else {
      user.overallRank = currentRank;
    }
    currentRank++;
  });

  return users;
}

export default function UserGrid({
  users,
  refreshingIds,
  onRefreshUser,
  currentPage,
  totalPages,
  onPageChange,
  canGoNext,
  canGoPrev,
  onNextPage,
  onPrevPage,
}: UserGridProps) {
  const [rankType, setRankType] = useState<"weekly" | "overall">("weekly");

  // Compute ranks
  const usersWithRanks = computeRanks(users);

  // Sort by selected rank ascending (rank #1 first)
  const sortedUsers = [...usersWithRanks].sort((a, b) => {
    if (rankType === "weekly")
      return (a.weeklyRank ?? Infinity) - (b.weeklyRank ?? Infinity);
    return (a.overallRank ?? Infinity) - (b.overallRank ?? Infinity);
  });

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2)
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1)
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-6">
      {/* Header & Rank Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} • {users.length} users
          </span>
          <Button
            size="sm"
            variant={rankType === "weekly" ? "default" : "outline"}
            onClick={() => setRankType("weekly")}
          >
            Weekly Rank
          </Button>
          <Button
            size="sm"
            variant={rankType === "overall" ? "default" : "outline"}
            onClick={() => setRankType("overall")}
          >
            Overall Rank
          </Button>
        </div>
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedUsers.map((user) => (
          <UserDetailModal key={user.id} user={user}>
            <Card className="group relative cursor-pointer hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={
                        user.profileimg ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                      }
                      alt={user.username}
                    />
                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.roll_num}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefreshUser(user);
                  }}
                  disabled={refreshingIds.includes(user.id)}
                >
                  <RefreshCw
                    className={cn(
                      "h-4 w-4",
                      refreshingIds.includes(user.id) && "animate-spin"
                    )}
                  />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {user.totalsolved}
                    </span>
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">
                      {user.weekly_solved}
                    </span>
                    <span className="text-xs text-muted-foreground">Week</span>
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant="outline">
                    {rankType === "weekly"
                      ? `Weekly Rank: #${user.weeklyRank}`
                      : `Overall Rank: #${user.overallRank}`}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </UserDetailModal>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={onPrevPage}
                  className={cn(!canGoPrev && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext
                  onClick={onNextPage}
                  className={cn(!canGoNext && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {sortedUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-sm">
            <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No users found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
