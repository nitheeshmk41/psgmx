"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "./components/Navbar";
import StatsCard from "./components/StatsCard";
import GroupStats from "./components/GroupStats";
import UserGrid from "./components/UserGrid";
import Charts from "./components/Charts";
import SearchAndFilter from "./components/SearchAndFilter";
import { usePagination } from "./hooks/usePagination";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface User {
  id: number;
  username: string;
  roll_num: string;
  class: "G1" | "G2";
  totalsolved: number;
  weekly_solved: number;
  leetcode_id?: string;
  profileimg?: string;
}

const USERS_PER_PAGE = 10;

export default function LeaderboardDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingIds, setRefreshingIds] = useState<number[]>([]);
  const [filterClass, setFilterClass] = useState<"G1" | "G2" | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error(error);
      toast.error("Failed to fetch users", {
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
      });
    }
    setUsers(data || []);
    setLoading(false);
  };

  const refreshUser = async (user: User) => {
    if (!user.leetcode_id) return;
    setRefreshingIds((prev) => [...prev, user.id]);

    try {
      await fetch(`/api/refreshUser/${user.leetcode_id}`);
      await fetchUsers();
      toast.success(`${user.username}'s data refreshed successfully`, {
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
      });
    } catch (error) {
      toast.error(`Failed to refresh ${user.username}'s data`, {
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
      });
    } finally {
      setRefreshingIds((prev) => prev.filter((id) => id !== user.id));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and search users
  const filteredUsers = users.filter((user) => {
    const matchesClass = filterClass === "ALL" || user.class === filterClass;
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roll_num.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Add top contributor badges
  const usersWithBadges = filteredUsers.map((user) => {
    const weeklyRank =
      [...users]
        .sort((a, b) => (b.weekly_solved || 0) - (a.weekly_solved || 0))
        .findIndex((u) => u.id === user.id) + 1;

    const overallRank =
      [...users]
        .sort((a, b) => (b.totalsolved || 0) - (a.totalsolved || 0))
        .findIndex((u) => u.id === user.id) + 1;

    return {
      ...user,
      weeklyRank,
      overallRank,
      isWeeklyTop: weeklyRank === 1,
      isOverallTop: overallRank === 1,
    };
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
  } = usePagination(usersWithBadges, USERS_PER_PAGE);

  // Overall Stats
  const totalStudents = users.length;
  const totalSolved = users.reduce((acc, u) => acc + (u.totalsolved || 0), 0);
  const weeklyProgress = users.reduce(
    (acc, u) => acc + (u.weekly_solved || 0),
    0
  );
  const weeklyLeader =
    users.sort((a, b) => (b.weekly_solved || 0) - (a.weekly_solved || 0))[0]
      ?.username || "-";

  // Groups
  const groupG1 = users.filter((u) => u.class === "G1");
  const groupG2 = users.filter((u) => u.class === "G2");

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 dark:bg-gray-900"
      >
        <Navbar />
        <div className="container mx-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-24 w-full rounded-xl bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-40 w-full rounded-xl bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-48 w-full rounded-xl bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <Navbar />
      <div className="container mx-auto p-4 sm:p-6 space-y-8">
        {/* Dashboard Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">
            Dashboard Overview
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Students"
              value={totalStudents} />
            <StatsCard
              title="Problems Solved"
              value={totalSolved} />
            <StatsCard
              title="Weekly Progress"
              value={weeklyProgress}/>
            <StatsCard
              title="Weekly Leader"
              value={weeklyLeader} />
          </div>
        </motion.div>

        {/* Group Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <GroupStats
            groupName="Group G1"
            members={groupG1.length}
            totalSolved={groupG1.reduce((sum, u) => sum + (u.totalsolved || 0), 0)}
            weeklyProgress={groupG1.reduce(
              (sum, u) => sum + (u.weekly_solved || 0),
              0
            )}
            weeklyTop={
              groupG1.sort((a, b) => (b.weekly_solved || 0) - (a.weekly_solved || 0))[0]
                ?.username || "-"
            }
            overallTop={
              groupG1.sort((a, b) => (b.totalsolved || 0) - (a.totalsolved || 0))[0]
                ?.username || "-"
            }
            color="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800"
          />
          <GroupStats
            groupName="Group G2"
            members={groupG2.length}
            totalSolved={groupG2.reduce((sum, u) => sum + (u.totalsolved || 0), 0)}
            weeklyProgress={groupG2.reduce(
              (sum, u) => sum + (u.weekly_solved || 0),
              0
            )}
            weeklyTop={
              groupG2.sort((a, b) => (b.weekly_solved || 0) - (a.weekly_solved || 0))[0]
                ?.username || "-"
            }
            overallTop={
              groupG2.sort((a, b) => (b.totalsolved || 0) - (a.totalsolved || 0))[0]
                ?.username || "-"
            }
            color="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800"
          />
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Charts users={users} />
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterClass={filterClass}
            onFilterChange={setFilterClass}
            totalResults={filteredUsers.length}
          />
        </motion.div>

        {/* User Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <UserGrid
            users={paginatedData}
            refreshingIds={refreshingIds}
            onRefreshUser={refreshUser}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            canGoNext={canGoNext}
            canGoPrev={canGoPrev}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}