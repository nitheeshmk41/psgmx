"use client";

import { useEffect, useState } from "react";
import GroupStats from "@/components/Stats/GroupStats";
import StatsCard from "@/components/Stats/StatsCard";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

interface User {
  id: number;
  username: string;
  roll_num: string;
  class: "G1" | "G2";
  totalsolved: number;
  weekly_solved: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (data) setUsers(data);
    };
    fetchUsers();
  }, []);

  const totalStudents = users.length;
  const totalSolved = users.reduce((sum, u) => sum + (u.totalsolved || 0), 0);
  const weeklyProgress = users.reduce(
    (sum, u) => sum + (u.weekly_solved || 0),
    0
  );
  const weeklyLeader =
    users.sort((a, b) => b.weekly_solved - a.weekly_solved)[0]?.username || "-";

  const groupG1 = users.filter((u) => u.class === "G1");
  const groupG2 = users.filter((u) => u.class === "G2");

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />
      <div className="p-6 space-y-6">
        {/* Overall Stats */}
        <h1 className="text-xl font-bold mb-4">Overall Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="Total Students" value={totalStudents} />
          <StatsCard title="Problems Solved" value={totalSolved} />
          <StatsCard title="Weekly Progress" value={weeklyProgress} />
          <StatsCard title="Weekly Leader" value={weeklyLeader} />
        </div>

        {/* Groups */}
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
              groupG1.sort((a, b) => b.weekly_solved - a.weekly_solved)[0]
                ?.username || "-"
            }
            overallTop={
              groupG1.sort((a, b) => b.totalsolved - a.totalsolved)[0]
                ?.username || "-"
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
              groupG2.sort((a, b) => b.weekly_solved - a.weekly_solved)[0]
                ?.username || "-"
            }
            overallTop={
              groupG2.sort((a, b) => b.totalsolved - a.totalsolved)[0]
                ?.username || "-"
            }
            color="bg-purple-900/40"
          />
        </div>
      </div>
    </div>
  );
}
