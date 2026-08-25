import { createSupabaseServerClient } from "@/lib/supabaseServer";
import DashboardClient from "./dashboard-client";
import { POTD } from "@/app/types";
import { fetchPOTD } from "@/lib/leetcode/service";
import { getAcademicStructure } from "@/lib/academics/service";

// Revalidate data every 60 seconds
export const revalidate = 60;

async function getPOTD(): Promise<POTD | null> {
  try {
    return await fetchPOTD();
  } catch (e) {
    console.error("Failed to fetch POTD", e);
    return null;
  }
}

async function getUsers() {
    try {
      const supabase = createSupabaseServerClient();
      const { data: users, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Supabase error:", error);
        return [];
      }
      return users || [];
    } catch (error) {
      console.error("Supabase is not configured:", error);
      return [];
    }
}

export default async function Page() {
    const [users, potd, structure] = await Promise.all([
        getUsers(),
        getPOTD(),
        getAcademicStructure(),
    ]);

  return (
        <DashboardClient initialUsers={users} potd={potd} structure={structure} />
  );
}
