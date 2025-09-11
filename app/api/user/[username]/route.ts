import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
              profile {
                realName
                userAvatar
                ranking
              }
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
                totalSubmissionNum {
                  difficulty
                  count
                }
              }
              languageProblemCount {
                languageName
                problemsSolved
              }
              userCalendar {
                streak
                totalActiveDays
                submissionCalendar
              }
            }
            activeDailyCodingChallengeQuestion {
              date
              link
              question {
                title
                difficulty
              }
            }
          }
        `,
        variables: { username },
      }),
    });

    const json = await res.json();

    if (json.errors) {
      return NextResponse.json({ error: json.errors }, { status: 400 });
    }

    const user = json?.data?.matchedUser;
    const potd = json?.data?.activeDailyCodingChallengeQuestion;

    if (!user) {
      return NextResponse.json(
        { error: `User ${username} not found` },
        { status: 404 }
      );
    }

    // ✅ Submissions by difficulty
    const acSubmissions = user.submitStatsGlobal.acSubmissionNum;
    const easySolved =
      acSubmissions.find((d: any) => d.difficulty === "Easy")?.count || 0;
    const mediumSolved =
      acSubmissions.find((d: any) => d.difficulty === "Medium")?.count || 0;
    const hardSolved =
      acSubmissions.find((d: any) => d.difficulty === "Hard")?.count || 0;

    // ✅ Acceptance Rate
    const total = user.submitStatsGlobal.totalSubmissionNum[0].count;
    const accepted = user.submitStatsGlobal.acSubmissionNum[0].count;
    const submissionRate = total > 0 ? (accepted / total) * 100 : 0;

    return NextResponse.json({
      username: user.username,
      realName: user.profile.realName,
      avatar: user.profile.userAvatar,
      overallRank: user.profile.ranking,
      totalSubmissions: total,
      acceptanceRate: submissionRate.toFixed(2) + "%",
      mostUsedLanguage: user.languageProblemCount?.[0]?.languageName || "N/A",
      totalActiveDays: user.userCalendar.totalActiveDays,
      // solved counts
      solved: {
        easy: easySolved,
        medium: mediumSolved,
        hard: hardSolved,
      },
      // POTD
      potd: potd
        ? {
            date: potd.date,
            link: "https://leetcode.com" + potd.link,
            title: potd.question.title,
            difficulty: potd.question.difficulty,
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
