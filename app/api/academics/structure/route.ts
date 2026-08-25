import { NextResponse } from "next/server";
import { getAcademicStructure } from "@/lib/academics/service";

export async function GET() {
  try {
    const structure = await getAcademicStructure();
    return NextResponse.json({ classes: structure });
  } catch (error) {
    console.error("Failed to fetch academic structure", error);
    return NextResponse.json(
      { error: "Unable to fetch classes right now. Please try again later." },
      { status: 500 }
    );
  }
}
