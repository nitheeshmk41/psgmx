import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/authAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const createClassSchema = z.object({
  code: z.string().trim().min(1),
  display_name: z.string().trim().min(1),
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
    .from("batches")
    .select("id, code, display_name, is_active, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch classes", error);
    return NextResponse.json({ error: "Unable to fetch classes" }, { status: 500 });
  }

  return NextResponse.json({ classes: data || [] });
}

export async function POST(request: Request) {
  const admin = await isAdminRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = await request.json();
  const parsed = createClassSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid class payload" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("batches")
    .insert([parsed.data])
    .select("id, code, display_name, is_active, display_order")
    .single();

  if (error) {
    console.error("Failed to create class", error);
    return NextResponse.json({ error: "Unable to create class" }, { status: 500 });
  }

  return NextResponse.json({ class: data });
}
