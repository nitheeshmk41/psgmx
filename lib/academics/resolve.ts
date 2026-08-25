import { UserLike } from "./types";

export function inferBatchCodeFromRoll(rollNum?: string | null) {
  if (!rollNum) return null;
  const match = rollNum.trim().match(/^(\d{2})mx/i);
  if (!match) return null;
  return `${match[1]}MX`;
}

export function resolveUserBatch(user: UserLike) {
  return user.batch_display_name || user.batch_code || inferBatchCodeFromRoll(user.roll_num) || "UNASSIGNED";
}

export function resolveUserGroup(user: UserLike) {
  return user.group_name || user.class || "UNASSIGNED";
}
