import {
  LeetCodeCalendarData,
  LeetCodeProfileData,
  LeetCodeRecentSubmissionsData,
  NormalizedLeetCodeProfile,
} from "./types";

function getDifficultyCount(items: Array<{ difficulty: string; count: number }> = [], difficulty: string) {
  return items.find((item) => item.difficulty === difficulty)?.count ?? 0;
}

export function parseProfile(data: LeetCodeProfileData): NormalizedLeetCodeProfile | null {
  const matchedUser = data.matchedUser;
  if (!matchedUser) {
    return null;
  }

  const ac = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
  const totalSubmissions = matchedUser.submitStatsGlobal?.totalSubmissionNum || [];

  const easySolved = getDifficultyCount(ac, "Easy");
  const mediumSolved = getDifficultyCount(ac, "Medium");
  const hardSolved = getDifficultyCount(ac, "Hard");
  const totalSolved = easySolved + mediumSolved + hardSolved;

  const totalSubCount = totalSubmissions.reduce((sum, item) => sum + item.count, 0);
  const acceptanceRate = totalSubCount > 0 ? (totalSolved / totalSubCount) * 100 : 0;

  return {
    username: matchedUser.username,
    realName: matchedUser.profile?.realName || "",
    about: matchedUser.profile?.aboutMe || "",
    avatar: matchedUser.profile?.userAvatar || "",
    ranking: matchedUser.profile?.ranking || 0,
    easySolved,
    mediumSolved,
    hardSolved,
    totalSolved,
    acceptanceRate,
    recentLanguages: (matchedUser.languageProblemCount || []).map((item) => item.languageName),
  };
}

export function parseWeeklySolved(data: LeetCodeRecentSubmissionsData, nowEpoch = Math.floor(Date.now() / 1000)) {
  const sevenDaysAgo = nowEpoch - 7 * 24 * 60 * 60;
  return (data.recentAcSubmissionList || []).filter((item) => Number(item.timestamp) >= sevenDaysAgo).length;
}

export function parseSubmissionCalendar(data: LeetCodeCalendarData): Record<string, number> {
  const calendarJson = data.matchedUser?.userCalendar?.submissionCalendar;
  if (!calendarJson) {
    return {};
  }

  try {
    const parsed = JSON.parse(calendarJson) as Record<string, number>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function isCalendarPermissionError(errors: Array<{ message: string }> = []) {
  return errors.some((err) => err.message.toLowerCase().includes("no permission to check the calendar"));
}
