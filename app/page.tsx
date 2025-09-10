"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "./components/Navbar";
import StatsCard from "./components/StatsCard";
import GroupStats from "./components/GroupStats";
import LeaderboardGrid from "./components/LeaderboardGrid";
import Charts from "./components/Charts";

interface User {
  id: number;
  username: string;
  roll_num: string;
  class: "G1" | "G2";
  totalsolved: number;
  weekly_solved: number;
  leetcode_id?: string;
}

export default function LeaderboardDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingIds, setRefreshingIds] = useState<number[]>([]);
  const [filterClass, setFilterClass] = useState<"G1" | "G2" | "ALL">("ALL");

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (error) console.error(error);
    setUsers(data || []);
    setLoading(false);
  };

  const refreshUser = async (user: User) => {
    if (!user.leetcode_id) return;
    setRefreshingIds((prev) => [...prev, user.id]);
    await fetch(`/api/refreshUser/${user.leetcode_id}`);
    await fetchUsers();
    setRefreshingIds((prev) => prev.filter((id) => id !== user.id));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers =
    filterClass === "ALL"
      ? users
      : users.filter((u) => u.class === filterClass);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar filterClass={filterClass} setFilterClass={setFilterClass} />

      <div className="p-6 space-y-6">
        {/* Overall Stats */}
        <h1 className="text-2xl font-bold mb-4">Overall Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="Total Students" value={totalStudents} />
          <StatsCard title="Problems Solved" value={totalSolved} />
          <StatsCard title="Weekly Progress" value={weeklyProgress} />
          <StatsCard title="Weekly Leader" value={weeklyLeader} />
        </div>

        {/* Group Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <GroupStats
            groupName="Group G1"
            members={groupG1.length}
            totalSolved={groupG1.reduce(
              (sum, u) => sum + (u.totalsolved || 0),
              0
            )}
            weeklyProgress={groupG1.reduce(
              (sum, u) => sum + (u.weekly_solved || 0),
              0
            )}
            weeklyTop={
              groupG1.sort(
                (a, b) => (b.weekly_solved || 0) - (a.weekly_solved || 0)
              )[0]?.username || "-"
            }
            overallTop={
              groupG1.sort(
                (a, b) => (b.totalsolved || 0) - (a.totalsolved || 0)
              )[0]?.username || "-"
            }
            color="bg-blue-900/40"
          />
          <GroupStats
            groupName="Group G2"
            members={groupG2.length}
            totalSolved={groupG2.reduce(
              (sum, u) => sum + (u.totalsolved || 0),
              0
            )}
            weeklyProgress={groupG2.reduce(
              (sum, u) => sum + (u.weekly_solved || 0),
              0
            )}
            weeklyTop={
              groupG2.sort(
                (a, b) => (b.weekly_solved || 0) - (a.weekly_solved || 0)
              )[0]?.username || "-"
            }
            overallTop={
              groupG2.sort(
                (a, b) => (b.totalsolved || 0) - (a.totalsolved || 0)
              )[0]?.username || "-"
            }
            color="bg-purple-900/40"
          />
        </div>

        {/* Charts */}
        <Charts users={users} />

        {/* Leaderboard */}
        <LeaderboardGrid
          users={filteredUsers}
          refreshingIds={refreshingIds}
          refreshUser={refreshUser}
        />
      </div>
    </div>
  );
}
