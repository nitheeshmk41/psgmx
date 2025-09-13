"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Code2, RefreshCw, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import UserDetailModal from "./UserDetailModal";
import SearchAndFilter from "./SearchAndFilter";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "./Navbar";

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
  weeklyRank?: number;
  overallRank?: number;
  ranking?: number;
}

const USERS_PER_PAGE = 12;

export default function UserGrid() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingIds, setRefreshingIds] = useState<number[]>([]);
  const [filterClass, setFilterClass] = useState<"G1" | "G2" | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [rankType, setRankType] = useState<"weekly" | "overall">("weekly");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (error) toast.error("Failed to fetch users");
    setUsers(data || []);
    setLoading(false);
  };

  const refreshUser = async (user: User) => {
    if (!user.leetcode_id) return;
    setRefreshingIds((prev) => [...prev, user.id]);
    try {
      await fetch(`/api/user/${user.leetcode_id}`);
      await fetchUsers();
      toast.success(`${user.username}'s data refreshed successfully`);
    } catch {
      toast.error(`Failed to refresh ${user.username}'s data`);
    } finally {
      setRefreshingIds((prev) => prev.filter((id) => id !== user.id));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const matches = users.filter((user) => {
      const matchesClass = filterClass === "ALL" || user.class === filterClass;
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roll_num.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesClass && matchesSearch;
    });
    setFilteredUsers(matches);
    setCurrentPage(1); // Reset to first page on filter change
  }, [users, filterClass, searchTerm]);

  // Compute ranks on filtered users
  const usersWithRanks = computeRanks(filteredUsers);

  // Top 3 weekly
  const top3Weekly = [...usersWithRanks].sort((a, b) => (a.weeklyRank ?? Infinity) - (b.weeklyRank ?? Infinity)).slice(0, 3);

  // Top 3 overall
  const top3Overall = [...usersWithRanks].sort((a, b) => (a.overallRank ?? Infinity) - (b.overallRank ?? Infinity)).slice(0, 3);

  // Sorted users for list
  const sortedUsers = [...usersWithRanks].sort((a, b) => {
    if (rankType === "weekly")
      return (a.weeklyRank ?? Infinity) - (b.weeklyRank ?? Infinity);
    return (a.overallRank ?? Infinity) - (b.overallRank ?? Infinity);
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / USERS_PER_PAGE);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  const onPageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const onNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const onPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;

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

  const isSearching = searchTerm.trim() !== "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-24 w-full rounded-xl bg-muted"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-40 w-full rounded-xl bg-muted"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-48 w-full rounded-xl bg-muted"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterClass={filterClass}
        onFilterChange={setFilterClass}
        totalResults={filteredUsers.length}
      />

      {!isSearching && (
        <>
          {/* Top 3 Weekly */}
          <div>
            <h3 className="text-xl font-bold tracking-tight mb-4">Top 3 Weekly Leaders</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3Weekly.map((user) => (
                <UserDetailModal key={user.id} user={user}>
                  <Card className="group relative cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-yellow-400/30">
                    <CardHeader className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="relative">
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
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 text-white text-xs font-bold flex items-center justify-center">
                            {user.weeklyRank}
                          </div>
                        </div>
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
                          refreshUser(user);
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
                    </CardContent>
                  </Card>
                </UserDetailModal>
              ))}
            </div>
          </div>

          {/* Top 3 Overall */}
          <div>
            <h3 className="text-xl font-bold tracking-tight mb-4">Top 3 Overall Leaders</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3Overall.map((user) => (
                <UserDetailModal key={user.id} user={user}>
                  <Card className="group relative cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-yellow-400/30">
                    <CardHeader className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="relative">
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
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 text-white text-xs font-bold flex items-center justify-center">
                            {user.overallRank}
                          </div>
                        </div>
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
                          refreshUser(user);
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
                    </CardContent>
                  </Card>
                </UserDetailModal>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Rank Type Toggle */}
      <div className="flex items-center justify-center">
        <Tabs
          defaultValue="weekly"
          onValueChange={(value) => setRankType(value as "weekly" | "overall")}
        >
          <TabsList>
            <TabsTrigger value="weekly">Weekly Rank</TabsTrigger>
            <TabsTrigger value="overall">Overall Rank</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* User List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedUsers.map((user) => (
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
                    refreshUser(user);
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

// Compute ranks with tie-handling
function computeRanks(users: User[]) {
  // Weekly rank
  const weeklySorted = [...users].sort(
    (a, b) => (b.weekly_solved || 0) - (a.weekly_solved || 0)
  );
  let currentRank = 1;
  weeklySorted.forEach((user, idx) => {
    if (idx > 0 && user.weekly_solved === weeklySorted[idx - 1].weekly_solved) {
      user.weeklyRank = weeklySorted[idx - 1].weeklyRank;
    } else {
      user.weeklyRank = currentRank;
    }
    currentRank += 1;
  });

  // Overall rank
  const overallSorted = [...users].sort(
    (a, b) => (a.ranking || Infinity) - (b.ranking || Infinity)
  );
  currentRank = 1;
  overallSorted.forEach((user, idx) => {
    if (idx > 0 && user.ranking === overallSorted[idx - 1].ranking) {
      user.overallRank = overallSorted[idx - 1].overallRank;
    } else {
      user.overallRank = currentRank;
    }
    currentRank += 1;
  });

  return users;
}