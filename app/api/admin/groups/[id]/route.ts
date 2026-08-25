import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/authAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const updateGroupSchema = z.object({
  batch_id: z.string().uuid().optional(),
  name: z.string().trim().min(1).optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().positive().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await isAdminRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateGroupSchema.safeParse(body);

  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Invalid group update payload" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("batch_groups")
    .update(parsed.data)
    .eq("id", id)
    .select("id, batch_id, name, is_active, display_order")
    .single();

  if (error) {
    console.error("Failed to update group", error);
    return NextResponse.json({ error: "Unable to update group" }, { status: 500 });
  }

  return NextResponse.json({ group: data });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await isAdminRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { id } = await context.params;
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("batch_groups")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("Failed to deactivate group", error);
    return NextResponse.json({ error: "Unable to deactivate group" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
