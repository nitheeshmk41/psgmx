// /app/api/potd/route.ts
import { NextResponse } from "next/server";
import { fetchPOTD } from "@/lib/leetcode/service";

export async function GET() {
  try {
    const potd = await fetchPOTD();
    if (!potd) {
      return NextResponse.json({ error: "POTD not found" }, { status: 404 });
    }
    return NextResponse.json(potd);
  } catch (error) {
    console.error("Failed to fetch POTD", error);
    return NextResponse.json(
      { error: "Unable to fetch LeetCode data right now. Please try again later." },
      { status: 500 }
    );
  }
}
