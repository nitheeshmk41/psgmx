import { supabase } from "./supabaseClient";

export async function refreshUser(user: any) {
  if (!user.leetcode_id) return user;

  try {
    const res = await fetch(`/api/user/${user.leetcode_id}`);
    const data = await res.json();

    if (!res.ok || data.error)
      throw new Error(data.error || "Failed to fetch user data");

    // Only update if totalSolved > 0
    const totalSolved =
      (data.solved?.easy || 0) +
      (data.solved?.medium || 0) +
      (data.solved?.hard || 0);

    if (totalSolved === 0) return user; // skip zero updates

    const weeklySolved = data.weeklySolved ?? user.weekly_solved ?? 0;
    const mostUsedLanguages =
      data.recentLanguages ?? user.recent_languages ?? [];

    // Update Supabase row
    const { data: updatedUser, error: supaError } = await supabase
      .from("users")
      .update({
        totalsolved: totalSolved,
        easy_solved: data.solved?.easy ?? user.easy_solved ?? 0,
        medium_solved: data.solved?.medium ?? user.medium_solved ?? 0,
        hard_solved: data.solved?.hard ?? user.hard_solved ?? 0,
        weekly_solved: weeklySolved,
        acceptance_rate: parseFloat(
          data.acceptanceRate?.replace("%", "") || "0"
        ),
        recent_languages: mostUsedLanguages,
        last_active: new Date().toISOString(),
        profileimg: data.avatar ?? user.profileimg,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (supaError) throw supaError;

    return updatedUser || user;
  } catch (err) {
    console.error("Refresh error:", err);
    return user; // fallback to existing data
  }
}
