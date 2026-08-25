export interface LeetCodeGraphQLError {
  message: string;
  path?: Array<string | number>;
}

export interface LeetCodeGraphQLResponse<T> {
  data?: T;
  errors?: LeetCodeGraphQLError[];
}

export interface LeetCodeProfileData {
  matchedUser: {
    username: string;
    profile: {
      realName: string;
      aboutMe: string;
      userAvatar: string;
      ranking: number;
    };
    submitStatsGlobal: {
      acSubmissionNum: Array<{ difficulty: string; count: number }>;
      totalSubmissionNum: Array<{ difficulty: string; count: number }>;
    };
    languageProblemCount: Array<{ languageName: string; problemsSolved: number }>;
  } | null;
}

export interface LeetCodeRecentSubmissionsData {
  recentAcSubmissionList: Array<{ id: string; timestamp: string }>;
}

export interface LeetCodeCalendarData {
  matchedUser: {
    userCalendar: {
      submissionCalendar: string | null;
    } | null;
  } | null;
}

export interface LeetCodePotdData {
  activeDailyCodingChallengeQuestion: {
    date: string;
    link: string;
    question: {
      title: string;
      titleSlug: string;
      difficulty: string;
      acRate: number;
    };
  } | null;
}

export interface NormalizedLeetCodeProfile {
  username: string;
  realName: string;
  about: string;
  avatar: string;
  ranking: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  acceptanceRate: number;
  recentLanguages: string[];
}

export interface LeetCodeUserBundle {
  profile: NormalizedLeetCodeProfile;
  weeklySolved: number;
  submissionCalendar: Record<string, number>;
}
