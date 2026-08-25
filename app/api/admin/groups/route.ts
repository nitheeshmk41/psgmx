import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/authAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const createGroupSchema = z.object({
  batch_id: z.string().uuid(),
  name: z.string().trim().min(1),
  is_active: z.boolean().optional().default(true),
  display_order: z.number().int().positive().optional().default(1),
});

export async function GET(request: Request) {
  const admin = await isAdminRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("batch_groups")
    .select("id, batch_id, name, is_active, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch groups", error);
    return NextResponse.json({ error: "Unable to fetch groups" }, { status: 500 });
  }

  return NextResponse.json({ groups: data || [] });
}

export async function POST(request: Request) {
  const admin = await isAdminRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = await request.json();
  const parsed = createGroupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid group payload" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("batch_groups")
    .insert([parsed.data])
    .select("id, batch_id, name, is_active, display_order")
    .single();

  if (error) {
    console.error("Failed to create group", error);
    return NextResponse.json({ error: "Unable to create group" }, { status: 500 });
  }

  return NextResponse.json({ group: data });
}
