import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;

  try {
    // Fetch submission calendar from LeetCode
    const calendarRes = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query userProfileCalendar($username: String!) {
            matchedUser(username: $username) {
              userCalendar {
                submissionCalendar
              }
            }
          }
        `,
        variables: { username },
      }),
    });

    if (!calendarRes.ok) {
      return NextResponse.json(
        { error: "LeetCode API request failed" },
        { status: calendarRes.status }
      );
    }

    const calendarJson = await calendarRes.json();
    
    if (calendarJson.errors) {
      return NextResponse.json({ error: calendarJson.errors }, { status: 400 });
    }

    const calendarStr = calendarJson?.data?.matchedUser?.userCalendar?.submissionCalendar;
    
    if (!calendarStr) {
      return NextResponse.json({ submissionCalendar: {} });
    }

    const submissionCalendar = JSON.parse(calendarStr);

    return NextResponse.json({ submissionCalendar });
  } catch (error: any) {
    console.error("Failed to fetch calendar:", error);
    return NextResponse.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
