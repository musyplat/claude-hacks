export const emotionMap = {
  stressed: {
    safeIntent: "Looking for a calm accountability partner for a focused work session",
    suggestedSkillNeed: "study group host",
    suggestedGoal: "buddy"
  },
  lonely: {
    safeIntent: "Open to a low-pressure coffee chat or collaborative work session",
    suggestedSkillNeed: "workout buddy",
    suggestedGoal: "meet"
  },
  curious: {
    safeIntent: "Interested in learning something new or swapping perspectives",
    suggestedSkillNeed: "language exchange",
    suggestedGoal: "learn"
  },
  energized: {
    safeIntent: "Ready to help someone or tackle a challenge together",
    suggestedSkillNeed: null,
    suggestedGoal: "help"
  },
  bored: {
    safeIntent: "Looking for something useful to work on with someone",
    suggestedSkillNeed: "study group host",
    suggestedGoal: "buddy"
  },
  overwhelmed: {
    safeIntent: "Would appreciate help breaking down a task or talking through a problem",
    suggestedSkillNeed: "writing feedback",
    suggestedGoal: "help_me"
  }
}

export function feelingToSafeRequest(feeling) {
  return emotionMap[feeling] || null
}
