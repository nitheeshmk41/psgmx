import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { fetchUserBundle } from "@/lib/leetcode/service";

export async function GET(
  req: Request,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;

  try {
    const supabase = createSupabaseServerClient();
    const bundle = await fetchUserBundle(username);

    // Persist normalized LeetCode metrics for leaderboard queries.
    const { error: supaError } = await supabase
      .from("users")
      .update({
        totalsolved: bundle.profile.totalSolved,
        easy_solved: bundle.profile.easySolved,
        medium_solved: bundle.profile.mediumSolved,
        hard_solved: bundle.profile.hardSolved,
        weekly_solved: bundle.weeklySolved,
        last_active: new Date().toISOString(),
        profileimg: bundle.profile.avatar,
        acceptance_rate: bundle.profile.acceptanceRate,
        ranking: bundle.profile.ranking,
        recent_languages: bundle.profile.recentLanguages,
        about: bundle.profile.about || null,
      })
      .eq("leetcode_id", username);

    if (supaError) {
      console.error("Supabase update error:", supaError);
      return NextResponse.json({ error: supaError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updated: {
        username: bundle.profile.username,
        realName: bundle.profile.realName,
        avatar: bundle.profile.avatar,
        ranking: bundle.profile.ranking,
        about: bundle.profile.about,
        solved: {
          easy: bundle.profile.easySolved,
          medium: bundle.profile.mediumSolved,
          hard: bundle.profile.hardSolved,
        },
        totalSolved: bundle.profile.totalSolved,
        weeklySolved: bundle.weeklySolved,
        acceptanceRate: `${bundle.profile.acceptanceRate.toFixed(2)}%`,
        recentLanguages: bundle.profile.recentLanguages,
        submissionCalendar: bundle.submissionCalendar,
      },
    });
  } catch (error: any) {
    console.error("LeetCode refresh failed:", error);
    const safeMessage = error?.message?.includes("not found")
      ? error.message
      : "Unable to fetch LeetCode data right now. Please try again later.";
    return NextResponse.json(
      { error: safeMessage },
      { status: 500 }
    );
  }
}
