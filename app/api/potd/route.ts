// /app/api/potd/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const url = "https://leetcode.com/graphql";

  const query = `
    query questionOfToday {
      activeDailyCodingChallengeQuestion {
        date
        link
        question {
          title
          titleSlug
          difficulty
          acRate
        }
      }
    }
  `;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });

    const json = await res.json();

    if (!json?.data?.activeDailyCodingChallengeQuestion) {
      return NextResponse.json(
        { error: "POTD not found", raw: json },
        { status: 500 }
      );
    }

    return NextResponse.json(json.data.activeDailyCodingChallengeQuestion);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch POTD", details: String(error) },
      { status: 500 }
    );
  }
}
