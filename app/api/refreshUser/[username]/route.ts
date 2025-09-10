import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  // Default structure (ensures Supabase update always has values)
  const updateData: any = {
    profileimg: null,
    totalsolved: 0,
    easy_solved: 0,
    medium_solved: 0,
    hard_solved: 0,
    acceptance_rate: 0,
    ranking: 0,
    weekly_solved: 0,
    recent_languages: [],
    last_active: null,
    about: "",
  };

  try {
    /* ----------------------------
     * 1️⃣ Try LeetCode Stats API
     * ---------------------------- */
    try {
      console.log(`[Stats API] Fetching for ${username}`);
      const statsRes = await fetch(
        `https://leetcode-stats-api.herokuapp.com/${username}`
      );
      if (statsRes.ok) {
        const statsData = await statsRes.json();

        updateData.totalsolved = statsData.totalSolved || 0;
        updateData.easy_solved = statsData.easySolved || 0;
        updateData.medium_solved = statsData.mediumSolved || 0;
        updateData.hard_solved = statsData.hardSolved || 0;
        updateData.acceptance_rate = statsData.acceptanceRate || 0;
        updateData.ranking = statsData.ranking || 0;

        // Last active from submissionCalendar
        if (statsData.submissionCalendar) {
          try {
            const cal =
              typeof statsData.submissionCalendar === "string"
                ? JSON.parse(statsData.submissionCalendar)
                : statsData.submissionCalendar;
            const timestamps = Object.keys(cal).map(Number);
            if (timestamps.length > 0) {
              const latest = new Date(Math.max(...timestamps) * 1000);
              updateData.last_active = latest.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
            }
          } catch (err) {
            console.error("Failed to parse submissionCalendar", err);
          }
        }
      } else {
        console.warn(`[Stats API] Failed with ${statsRes.status}`);
      }
    } catch (err) {
      console.error("[Stats API] Error:", err);
    }

    /* ----------------------------
     * 2️⃣ Try Alfa API (profile)
     * ---------------------------- */
    try {
      console.log(`[Alfa API] Fetching profile for ${username}`);
      const alfaProfileRes = await fetch(
        `https://alfa-leetcode-api.onrender.com/${username}`
      );
      if (alfaProfileRes.ok) {
        const alfaProfile = await alfaProfileRes.json();
        updateData.profileimg =
          alfaProfile.avatar ||
          "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg?semt=ais_hybrid&w=740&q=80";
        updateData.recent_languages = alfaProfile.skillTags || [];
        updateData.about = alfaProfile.about || "";
      } else {
        console.warn(`[Alfa Profile API] Failed with ${alfaProfileRes.status}`);
      }
    } catch (err) {
      console.error("[Alfa API - Profile] Error:", err);
    }

    /* ----------------------------
     * 3️⃣ Try Alfa API (submissions → weekly solved)
     * ---------------------------- */
    try {
      console.log(`[Alfa API] Fetching submissions for ${username}`);
      const alfaSubRes = await fetch(
        `https://alfa-leetcode-api.onrender.com/${username}/acSubmission`
      );
      if (alfaSubRes.ok) {
        const alfaSubs = await alfaSubRes.json();
        const submissions = Array.isArray(alfaSubs.submission)
          ? alfaSubs.submission
          : Array.isArray(alfaSubs)
          ? alfaSubs
          : [];

        const now = Math.floor(Date.now() / 1000);
        const sevenDaysAgo = now - 7 * 24 * 60 * 60;

        updateData.weekly_solved = submissions.filter(
          (s: any) => Number(s.timestamp) >= sevenDaysAgo
        ).length;
      } else {
        console.warn(`[Alfa Submissions API] Failed with ${alfaSubRes.status}`);
      }
    } catch (err) {
      console.error("[Alfa API - Submissions] Error:", err);
    }

    /* ----------------------------
     * 4️⃣ Update Supabase
     * ---------------------------- */
    console.log("[Supabase] Updating with:", updateData);

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("leetcode_id", username)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json(
        { warning: `No user found with leetcode_id=${username}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "✅ User stats refreshed (with partial fallback)",
      username,
      ...updateData,
    });
  } catch (err: any) {
    console.error("❌ Refresh route failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
