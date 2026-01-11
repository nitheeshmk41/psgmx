"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import StatsCard from "./components/Stats/StatsCard";
import GroupStats from "./components/Stats/GroupStats";
import UserGrid from "./components/UserGrid";
import Charts from "./components/Charts";
import { toast } from "sonner";
import { motion } from "framer-motion";
import POTDBanner from "./components/POTDBanner";
import { DisclaimerModal } from "./components/DisclaimerModal";
import { User, POTD } from "@/app/types";
import { Button } from "@/components/ui/button";

import CursorFollower from "./components/ui/cursor-follower";

interface DashboardClientProps {
  initialUsers: User[];
  potd: POTD | null;
}

export default function DashboardClient({ initialUsers, potd }: DashboardClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [refreshingIds, setRefreshingIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Sync state if props change (e.g. server revalidation)
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Refresh Single User
  const refreshUser = async (user: User) => {
    if (!user.leetcode_id) return;
    setRefreshingIds((prev) => [...prev, user.id]);
    try {
      // Call API to refresh user data using LeetCode API
      const res = await fetch(`/api/user/${user.leetcode_id}`);
      if (!res.ok) throw new Error("Failed to refresh");
      
      const data = await res.json();
      
      if (data.updated) {
          // Update local state optimistically or strictly from response
          setUsers((prev) => prev.map(u => 
              u.id === user.id ? { ...u, ...data.updated, totalsolved: data.updated.totalSolved, weekly_solved: data.updated.weeklySolved } : u
          ));
          toast.success(`${user.username}'s data refreshed successfully`);
      }
    } catch {
      toast.error(`Failed to refresh ${user.username}'s data`);
    } finally {
      setRefreshingIds((prev) => prev.filter((id) => id !== user.id));
    }
  };

  useEffect(() => {
    // Check if the modal has been shown in this session
    const hasSeenModal = sessionStorage.getItem("hasSeenDisclaimer");
    if (!hasSeenModal) {
      setShowModal(true);
      sessionStorage.setItem("hasSeenDisclaimer", "true");
    }
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  // Compute Stats
  const weeklySolved = users.reduce((acc, user) => acc + (user.weekly_solved || 0), 0);
  
  const topWeekly = [...users].sort((a, b) => (b.weekly_solved || 0) - (a.weekly_solved || 0))[0];
  const topOverall = [...users].sort((a, b) => (b.totalsolved || 0) - (a.totalsolved || 0))[0];
  
  // Group Stats
  const g1Users = users.filter((u) => u.class === "G1");
  const g2Users = users.filter((u) => u.class === "G2");

  const g1Weekly = g1Users.reduce((a, b) => a + (b.weekly_solved || 0), 0);
  const g2Weekly = g2Users.reduce((a, b) => a + (b.weekly_solved || 0), 0);
  
  const g1TopWeekly = [...g1Users].sort((a, b) => (b.weekly_solved || 0) - (a.weekly_solved || 0))[0];
  const g2TopWeekly = [...g2Users].sort((a, b) => (b.weekly_solved || 0) - (a.weekly_solved || 0))[0];

  const g1TopOverall = [...g1Users].sort((a, b) => (b.totalsolved || 0) - (a.totalsolved || 0))[0];
  const g2TopOverall = [...g2Users].sort((a, b) => (b.totalsolved || 0) - (a.totalsolved || 0))[0];

  // Animation variants for letters
  const letterContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const letterChild = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <CursorFollower />
      
      <main className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8 max-w-7xl pt-20 md:pt-24">
        {/* Hero Section / POTD */}
        <section className="relative flex flex-col items-center justify-center space-y-6 md:space-y-8 text-center py-8 md:py-12 overflow-hidden rounded-3xl bg-transparent min-h-[30vh] md:min-h-[40vh]">
          <motion.div
            variants={letterContainer}
            initial="hidden"
            animate="visible"
            className="relative z-10 space-y-4 px-2 md:px-4"
          >
            {/* <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs md:text-sm font-medium text-primary backdrop-blur-sm mb-2 md:mb-4 shadow-sm dark:shadow-none">
               <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
               Live Leaderboard
            </div> */}

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter pb-2 flex flex-wrap justify-center gap-x-2 md:gap-x-3 gap-y-1 relative group cursor-default">
              {"PSG MX Leaderboard".split(" ").map((word, i) => (
                 <span key={i} className="inline-block whitespace-nowrap bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300">
                   {word.split("").map((char, j) => (
                     <motion.span 
                        key={`${i}-${j}`} 
                        variants={letterChild} 
                        whileHover={{ scale: 1.2, rotate: Math.random() * 10 - 5, color: "var(--primary)" }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="inline-block cursor-default"
                     >
                       {char}
                     </motion.span>
                   ))}
                 </span>
              ))}
              
              {/* Binocular/Spotlight Effect */}
               <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,_transparent_0%,_transparent_100px,_rgba(0,0,0,0.05)_150px)] dark:bg-[radial-gradient(circle_at_center,_transparent_0%,_transparent_100px,_rgba(255,255,255,0.05)_150px)] blur-md z-20 mix-blend-overlay w-full h-full animate-spotlight" />
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-muted-foreground text-base sm:text-lg md:text-2xl max-w-2xl md:max-w-3xl mx-auto font-light leading-relaxed px-4"
            >
              Track your LeetCode progress, compete with peers, and master algorithms.
            </motion.p>
          </motion.div>

          {potd && <div className="relative z-10 w-full max-w-3xl px-2 md:px-4"><POTDBanner potd={potd} /></div>}
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="col-span-2 sm:col-span-1">
            <StatsCard
              title="Total Students"
              value={users.length}
              subtitle="Active coders"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <StatsCard
              title="Weekly Progress"
              value={weeklySolved}
              subtitle="Problems solved this week"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <StatsCard
              title="Weekly Leader"
              value={topWeekly?.username || "-"}
              subtitle={`${topWeekly?.weekly_solved || 0} solved`}
              isFlip={true}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <StatsCard
              title="Overall Leader"
              value={topOverall?.username || "-"}
              subtitle={`${topOverall?.totalsolved || 0} solved`}
              isFlip={true}
            />
          </div>
        </div>

        {/* Group Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GroupStats
            groupName="G1"
            members={g1Users.length}
            weeklyProgress={g1Weekly}
            weeklyTop={g1TopWeekly?.username || "-"}
            overallTop={g1TopOverall?.username || "-"}
            color="text-blue-500"
          />
          <GroupStats
            groupName="G2"
            members={g2Users.length}
            weeklyProgress={g2Weekly}
            weeklyTop={g2TopWeekly?.username || "-"}
            overallTop={g2TopOverall?.username || "-"}
            color="text-green-500"
          />
        </div>

        {/* Charts Toggle */}
        <div className="flex justify-center">
            <Button variant="outline" onClick={() => setIsChartVisible(!isChartVisible)}>
                {isChartVisible ? "Hide Analytics" : "Show Analytics"}
            </Button>
        </div>

        {/* Charts Section */}
        {isChartVisible && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
            >
                <Charts users={users} />
            </motion.div>
        )}

        {/* Main Users Grid */}
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
                <span className="text-sm text-muted-foreground">
                    Last updated: {lastUpdated}
                </span>
             </div>
             
             <UserGrid 
                users={users} 
                onRefresh={refreshUser} 
                refreshingIds={refreshingIds}
             />
        </div>
      </main>

      {/* Modal */}
      {showModal && <DisclaimerModal open={showModal} onOpenChange={setShowModal} />}
    </div>
  );
}
