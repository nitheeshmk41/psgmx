import { NextResponse } from "next/server";
import { fetchUserCalendar } from "@/lib/leetcode/service";

export async function GET(
  req: Request,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;

  try {
    const result = await fetchUserCalendar(username);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to fetch calendar:", error);
    return NextResponse.json(
      {
        error: "Unable to fetch LeetCode data right now. Please try again later.",
        submissionCalendar: {},
      },
      { status: 200 }
    );
  }
}
