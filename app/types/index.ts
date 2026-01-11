export interface User {
  id: number;
  username: string;
  roll_num: string;
  class: "G1" | "G2";
  totalsolved: number;
  weekly_solved: number;
  // LeetCode specific fields
  leetcode_id?: string;
  profileimg?: string;
  last_active?: string; // ISO Date string
  ranking?: number;
  acceptance_rate?: number;
  easy_solved?: number;
  medium_solved?: number;
  hard_solved?: number;
  recent_languages?: string[];
  about?: string;
  
  // Computed for UI
  weeklyRank?: number;
  overallRank?: number;
}

export interface POTD {
  date: string;
  link: string;
  question: {
    title: string;
    titleSlug: string;
    difficulty: string;
    acRate: number;
  };
}

export interface LeetCodeProfileResponse {
  matchedUser: {
    username: string;
    profile: {
      realName: string;
      aboutMe: string;
      userAvatar: string;
      ranking: number;
    };
    submitStatsGlobal: {
      acSubmissionNum: { difficulty: string; count: number }[];
      totalSubmissionNum: { difficulty: string; count: number }[];
    };
    languageProblemCount: { languageName: string; problemsSolved: number }[];
  } | null;
}
