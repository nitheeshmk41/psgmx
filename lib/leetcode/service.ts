import { leetCodeGraphQL } from "./client";
import {
  LEETCODE_CALENDAR_QUERY,
  LEETCODE_POTD_QUERY,
  LEETCODE_PROFILE_QUERY,
  LEETCODE_RECENT_AC_QUERY,
} from "./queries";
import { isCalendarPermissionError, parseProfile, parseSubmissionCalendar, parseWeeklySolved } from "./parser";
import {
  LeetCodeCalendarData,
  LeetCodePotdData,
  LeetCodeProfileData,
  LeetCodeRecentSubmissionsData,
  LeetCodeUserBundle,
} from "./types";

export async function fetchPOTD() {
  const res = await leetCodeGraphQL<LeetCodePotdData>(
    { query: LEETCODE_POTD_QUERY },
    { timeoutMs: 10000, retries: 1, cache: "force-cache", revalidateSeconds: 3600 }
  );
  return res.data?.activeDailyCodingChallengeQuestion || null;
}

export async function fetchUserBundle(username: string): Promise<LeetCodeUserBundle> {
  const profileRes = await leetCodeGraphQL<LeetCodeProfileData, { username: string }>(
    {
      query: LEETCODE_PROFILE_QUERY,
      variables: { username },
    },
    { timeoutMs: 12000, retries: 1 }
  );

  if (profileRes.errors?.length) {
    throw new Error(profileRes.errors[0].message || "LeetCode profile query failed");
  }

  const parsedProfile = profileRes.data ? parseProfile(profileRes.data) : null;
  if (!parsedProfile) {
    throw new Error(`LeetCode user ${username} not found`);
  }

  const recentRes = await leetCodeGraphQL<LeetCodeRecentSubmissionsData, { username: string }>(
    {
      query: LEETCODE_RECENT_AC_QUERY,
      variables: { username },
    },
    { timeoutMs: 10000, retries: 1 }
  );

  if (recentRes.errors?.length) {
    throw new Error(recentRes.errors[0].message || "LeetCode recent submissions query failed");
  }

  const weeklySolved = parseWeeklySolved({
    recentAcSubmissionList: recentRes.data?.recentAcSubmissionList || [],
  });

  let submissionCalendar: Record<string, number> = {};
  try {
    const calendarRes = await leetCodeGraphQL<LeetCodeCalendarData, { username: string }>(
      {
        query: LEETCODE_CALENDAR_QUERY,
        variables: { username },
      },
      { timeoutMs: 10000, retries: 0 }
    );

    if (calendarRes.errors?.length) {
      if (!isCalendarPermissionError(calendarRes.errors)) {
        console.warn("LeetCode calendar query returned errors", {
          username,
          errors: calendarRes.errors,
        });
      }
    } else if (calendarRes.data) {
      submissionCalendar = parseSubmissionCalendar(calendarRes.data);
    }
  } catch (error) {
    console.warn("LeetCode calendar unavailable", { username, error });
  }

  return {
    profile: parsedProfile,
    weeklySolved,
    submissionCalendar,
  };
}

export async function fetchUserCalendar(username: string) {
  const calendarRes = await leetCodeGraphQL<LeetCodeCalendarData, { username: string }>(
    {
      query: LEETCODE_CALENDAR_QUERY,
      variables: { username },
    },
    { timeoutMs: 10000, retries: 0 }
  );

  if (calendarRes.errors?.length) {
    if (isCalendarPermissionError(calendarRes.errors)) {
      return { submissionCalendar: {}, restricted: true };
    }
    throw new Error(calendarRes.errors[0].message || "Calendar query failed");
  }

  return {
    submissionCalendar: parseSubmissionCalendar(calendarRes.data as LeetCodeCalendarData),
    restricted: false,
  };
}
