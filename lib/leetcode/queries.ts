export const LEETCODE_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        realName
        aboutMe
        userAvatar
        ranking
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
        totalSubmissionNum {
          difficulty
          count
        }
      }
      languageProblemCount {
        languageName
        problemsSolved
      }
    }
  }
`;

export const LEETCODE_RECENT_AC_QUERY = `
  query recentAcSubmissions($username: String!) {
    recentAcSubmissionList(username: $username, limit: 100) {
      id
      timestamp
    }
  }
`;

export const LEETCODE_CALENDAR_QUERY = `
  query userProfileCalendar($username: String!) {
    matchedUser(username: $username) {
      userCalendar {
        submissionCalendar
      }
    }
  }
`;

export const LEETCODE_POTD_QUERY = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      link
      question {
        title
        titleSlug
        difficulty
        acRate
      }
    }
  }
`;
