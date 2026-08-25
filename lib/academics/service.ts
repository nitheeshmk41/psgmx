import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { BatchWithGroups } from "./types";
import { inferBatchCodeFromRoll } from "./resolve";

export async function getStructureFromTables() {
  const supabase = createSupabaseServerClient();

  const batchesResult = await supabase
    .from("batches")
    .select("id, code, display_name, is_active, display_order")
    .order("display_order", { ascending: true });

  if (batchesResult.error) {
    throw batchesResult.error;
  }

  const groupsResult = await supabase
    .from("batch_groups")
    .select("id, batch_id, name, is_active, display_order")
    .order("display_order", { ascending: true });

  if (groupsResult.error) {
    throw groupsResult.error;
  }

  const groupsByBatch = new Map<string, Array<{ id: string; name: string; isActive: boolean; displayOrder: number }>>();

  for (const group of groupsResult.data || []) {
    if (!groupsByBatch.has(group.batch_id)) {
      groupsByBatch.set(group.batch_id, []);
    }
    groupsByBatch.get(group.batch_id)!.push({
      id: group.id,
      name: group.name,
      isActive: group.is_active,
      displayOrder: group.display_order,
    });
  }

  const structure: BatchWithGroups[] = (batchesResult.data || []).map((batch) => ({
    id: batch.id,
    code: batch.code,
    displayName: batch.display_name,
    isActive: batch.is_active,
    displayOrder: batch.display_order,
    groups: groupsByBatch.get(batch.id) || [],
  }));

  return structure;
}

export async function getStructureFromUsersFallback() {
  const supabase = createSupabaseServerClient();

  const usersResult = await supabase.from("users").select("id, roll_num, class");
  if (usersResult.error) {
    throw usersResult.error;
  }

  const map = new Map<string, Set<string>>();

  for (const user of usersResult.data || []) {
    const batchCode = inferBatchCodeFromRoll(user.roll_num) || "UNASSIGNED";
    const groupName = user.class || "UNASSIGNED";

    if (!map.has(batchCode)) {
      map.set(batchCode, new Set<string>());
    }
    map.get(batchCode)!.add(groupName);
  }

  const sortedBatchCodes = [...map.keys()].sort((a, b) => a.localeCompare(b));

  return sortedBatchCodes.map((code, idx) => {
    const groups = [...(map.get(code) || new Set<string>())]
      .sort((a, b) => a.localeCompare(b))
      .map((name, groupIdx) => ({
        id: `${code}-${name}`,
        name,
        isActive: true,
        displayOrder: groupIdx + 1,
      }));

    return {
      id: code,
      code,
      displayName: code,
      isActive: true,
      displayOrder: idx + 1,
      groups,
    };
  });
}

export async function getAcademicStructure() {
  try {
    const structure = await getStructureFromTables();
    if (structure.length > 0) {
      return structure;
    }
  } catch (error) {
    console.warn("Falling back to users-based structure", error);
  }

  try {
    return await getStructureFromUsersFallback();
  } catch (error) {
    console.error("Unable to load academic structure", error);
    return [];
  }
}
