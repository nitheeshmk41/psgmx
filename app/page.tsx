import { supabase } from "@/lib/supabaseClient";
import DashboardClient from "./dashboard-client";
import { POTD } from "@/app/types";

// Revalidate data every 60 seconds
export const revalidate = 60;

async function getPOTD(): Promise<POTD | null> {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
        },
        body: JSON.stringify({
            query: `
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
            `
        }),
        next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.activeDailyCodingChallengeQuestion || null;
  } catch (e) {
      console.error("Failed to fetch POTD", e);
      return null;
  }
}

async function getUsers() {
    const { data: users, error } = await supabase.from("users").select("*");
    if (error) {
        console.error("Supabase error:", error);
        return [];
    }
    return users || [];
}

export default async function Page() {
  const [users, potd] = await Promise.all([getUsers(), getPOTD()]);

  return (
    <DashboardClient initialUsers={users} potd={potd} />
  );
}
