export interface User {
  id: number;
  username: string;
  roll_num: string;
  class: "G1" | "G2";
  totalsolved: number;
  weekly_solved: number;
  leetcode_id?: string;
  profileimg?: string;
  last_active?: string;
  weeklyRank?: number;
  overallRank?: number;
  ranking?: number;
}
