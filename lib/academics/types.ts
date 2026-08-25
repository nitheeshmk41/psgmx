export interface BatchRecord {
  id: string;
  code: string;
  display_name: string;
  is_active: boolean;
  display_order: number;
}

export interface GroupRecord {
  id: string;
  batch_id: string;
  name: string;
  is_active: boolean;
  display_order: number;
}

export interface BatchWithGroups {
  id: string;
  code: string;
  displayName: string;
  isActive: boolean;
  displayOrder: number;
  groups: Array<{
    id: string;
    name: string;
    isActive: boolean;
    displayOrder: number;
  }>;
}

export interface UserLike {
  id: number;
  username: string;
  roll_num: string;
  class?: string | null;
  batch_code?: string | null;
  batch_display_name?: string | null;
  group_name?: string | null;
}
