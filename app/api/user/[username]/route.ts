import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function GET(
  req: Request,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;

  try {
    // 1️⃣ Fetch user profile from LeetCode
    const profileRes = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              profile {
                realName
                aboutMe
                userAvatar
                ranking
              }
              submitStatsGlobal {
                acSubmissionNum { difficulty count }
                totalSubmissionNum { difficulty count }
              }
              languageProblemCount {
                languageName
                problemsSolved
              }
            }
          }
        `,
        variables: { username },
      }),
    });

    if (!profileRes.ok) {
      const text = await profileRes.text();
      console.error("LeetCode API failed:", profileRes.status, text);
      return NextResponse.json(
        { error: "LeetCode API request failed" },
        { status: profileRes.status }
      );
    }

    const profileJson = await profileRes.json();
    if (profileJson.errors) {
      return NextResponse.json({ error: profileJson.errors }, { status: 400 });
    }

    const user = profileJson?.data?.matchedUser;
    if (!user)
      return NextResponse.json(
        { error: `User ${username} not found` },
        { status: 404 }
      );

    // 2️⃣ Calculate solved counts
    const acSubmissions = user.submitStatsGlobal?.acSubmissionNum || [];
    const easySolved =
      acSubmissions.find((d: any) => d.difficulty === "Easy")?.count ?? 0;
    const mediumSolved =
      acSubmissions.find((d: any) => d.difficulty === "Medium")?.count ?? 0;
    const hardSolved =
      acSubmissions.find((d: any) => d.difficulty === "Hard")?.count ?? 0;
    const totalSolved = easySolved + mediumSolved + hardSolved;

    if (totalSolved === 0) {
      return NextResponse.json({ cached: true, totalSolved: 0 });
    }

    // 3️⃣ Acceptance rate
    const totalSubs =
      user.submitStatsGlobal?.totalSubmissionNum?.reduce(
        (acc: number, cur: any) => acc + cur.count,
        0
      ) ?? 0;
    const acceptedSubs = totalSolved; // total AC submissions
    const acceptanceRate = totalSubs > 0 ? (acceptedSubs / totalSubs) * 100 : 0;

    // 4️⃣ Languages
    const recentLanguages =
      user.languageProblemCount?.map((lang: any) => lang.languageName) || [];

    // 5️⃣ Weekly solved: only AC submissions
    let weeklySolved = 0;
    try {
      const recentAcRes = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query recentAcSubmissions($username: String!) {
              recentAcSubmissionList(username: $username, limit: 100) {
                id
                timestamp
              }
            }
          `,
          variables: { username },
        }),
      });

      const recentJson = await recentAcRes.json();
      const submissions = recentJson?.data?.recentAcSubmissionList || [];

      const now = Math.floor(Date.now() / 1000);
      const sevenDaysAgo = now - 7 * 24 * 60 * 60;

      weeklySolved = submissions.filter(
        (sub: any) => sub.timestamp >= sevenDaysAgo
      ).length;
    } catch (e) {
      console.error("Failed to fetch recent AC submissions:", e);
    }

    // 6️⃣ Update Supabase
    const { error: supaError } = await supabase
      .from("users")
      .update({
        totalsolved: totalSolved,
        easy_solved: easySolved,
        medium_solved: mediumSolved,
        hard_solved: hardSolved,
        weekly_solved: weeklySolved,
        last_active: new Date().toISOString(),
        profileimg: user.profile.userAvatar,
        acceptance_rate: acceptanceRate,
        ranking: user.profile.ranking,
        recent_languages: recentLanguages,
        about: user.profile.aboutMe || null,
      })
      .eq("leetcode_id", username);

    if (supaError) {
      console.error("Supabase update error:", supaError);
      return NextResponse.json({ error: supaError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updated: {
        username: user.username,
        realName: user.profile.realName,
        avatar: user.profile.userAvatar,
        ranking: user.profile.ranking,
        about: user.profile.aboutMe,
        solved: { easy: easySolved, medium: mediumSolved, hard: hardSolved },
        totalSolved,
        weeklySolved,
        acceptanceRate: acceptanceRate.toFixed(2) + "%",
        recentLanguages,
      },
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
