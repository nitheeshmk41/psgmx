"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const router = useRouter();
  const [dailyProblem, setDailyProblem] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);

  // Fetch daily problem from API and cache in localStorage
  useEffect(() => {
    const fetchDailyProblem = async () => {
      const cached = localStorage.getItem("dailyProblem");
      if (cached) {
        setDailyProblem(cached);
        setLoading(false);
      }

      try {
        const res = await fetch("https://alfa-leetcode-api.onrender.com/daily");
        const data = await res.json();
        if (data.problem) {
          setDailyProblem(data.problem);
          localStorage.setItem("dailyProblem", data.problem);
        } else {
          setDailyProblem("No problem available today.");
        }
      } catch (err) {
        console.error(err);
        setDailyProblem("Failed to fetch daily problem.");
      } finally {
        setLoading(false);
      }
    };

    fetchDailyProblem();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <nav className="backdrop-blur-lg bg-gray-900/70 shadow-lg sticky top-0 z-50 p-4 flex flex-col md:flex-row md:justify-between items-center gap-4 md:gap-0">
      {/* Left - Brand */}
      <h1
        className="text-2xl font-extrabold text-white hover:text-blue-400 cursor-pointer transition-all duration-300"
        onClick={() => router.push("/")}
      >
        PSGMX LeetBoard
      </h1>

      {/* Center - POTD */}
      <div className="text-white text-center px-4 py-2 bg-gray-800/30 rounded-lg backdrop-blur-md hover:bg-gray-800/50 transition flex-1 max-w-md truncate">
        {loading ? "Loading Problem of the Day..." : dailyProblem}
      </div>

      {/* Right - Links */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/")}
          className="text-white hover:text-blue-400 font-medium transition-colors duration-200"
        >
          Leaderboard
        </button>
        <button
          onClick={() => router.push("/admin")}
          className="text-white hover:text-blue-400 font-medium transition-colors duration-200"
        >
          Admin
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md shadow-md text-white transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
