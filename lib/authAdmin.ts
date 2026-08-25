import { createSupabasePublicServerClient, createSupabaseServerClient } from "./supabaseServer";

export async function isAdminRequest(request: Request) {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return { ok: false, status: 401, error: "Unauthorized" } as const;
  }

  const publicClient = createSupabasePublicServerClient();
  const userResult = await publicClient.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    return { ok: false, status: 401, error: "Unauthorized" } as const;
  }

  const adminClient = createSupabaseServerClient();
  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", userResult.data.user.id)
    .single();

  if (error || profile?.role !== "admin") {
    return { ok: false, status: 403, error: "Forbidden" } as const;
  }

  return { ok: true, userId: userResult.data.user.id } as const;
}
