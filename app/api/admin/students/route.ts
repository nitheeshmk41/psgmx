import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/authAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const updateStudentSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().trim().min(1).optional(),
  roll_num: z.string().trim().min(1).optional(),
  leetcode_id: z.string().trim().min(1).optional(),
  class: z.string().trim().min(1).optional(),
  batch_id: z.string().uuid().nullable().optional(),
  group_id: z.string().uuid().nullable().optional(),
  batch_code: z.string().trim().min(1).nullable().optional(),
  batch_display_name: z.string().trim().min(1).nullable().optional(),
  group_name: z.string().trim().min(1).nullable().optional(),
});

export async function GET(request: Request) {
  const admin = await isAdminRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const url = new URL(request.url);
  const batch = (url.searchParams.get("batch") || "").trim().toUpperCase();
  const group = (url.searchParams.get("group") || "").trim().toUpperCase();
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    console.error("Failed to fetch students", error);
    return NextResponse.json({ error: "Unable to fetch students" }, { status: 500 });
  }

  const students = (data || []).filter((student) => {
    const studentBatch = (student.batch_display_name || student.batch_code || "").toUpperCase();
    const studentGroup = (student.group_name || student.class || "").toUpperCase();

    if (batch && studentBatch && studentBatch !== batch) {
      return false;
    }

    if (group && studentGroup && studentGroup !== group) {
      return false;
    }

    if (!q) {
      return true;
    }

    const haystack = `${student.username || ""} ${student.roll_num || ""} ${student.leetcode_id || ""}`.toLowerCase();
    return haystack.includes(q);
  });

  return NextResponse.json({ students });
}

export async function PATCH(request: Request) {
  const admin = await isAdminRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = await request.json();
  const parsed = updateStudentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid student payload" }, { status: 400 });
  }

  const { id, ...changes } = parsed.data;
  if (Object.keys(changes).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .update(changes)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update student", error);
    return NextResponse.json({ error: "Unable to update student" }, { status: 500 });
  }

  return NextResponse.json({ student: data });
}
