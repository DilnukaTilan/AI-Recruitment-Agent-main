const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEFAULT_CANDIDATE_MAX_JOINS = 1;

export function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

export function isValidEmail(email) {
  return EMAIL_REGEX.test(normalizeEmail(email));
}

export function splitCandidateEmails(candidateEmails) {
  if (Array.isArray(candidateEmails)) {
    return candidateEmails
      .flatMap((email) =>
        typeof email === "string" ? email.split(/[\n,;]+/) : [],
      )
      .map((email) => email.trim())
      .filter(Boolean);
  }

  if (typeof candidateEmails === "string") {
    return candidateEmails
      .split(/[\n,;]+/)
      .map((email) => email.trim())
      .filter(Boolean);
  }

  return [];
}

export function normalizeCandidateEmails(candidateEmails) {
  return Array.from(
    new Set(
      splitCandidateEmails(candidateEmails)
        .map(normalizeEmail)
        .filter(isValidEmail),
    ),
  );
}

export function normalizeCandidateJoinLimit(maxJoins) {
  const parsedValue = Number.parseInt(maxJoins, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return DEFAULT_CANDIDATE_MAX_JOINS;
  }

  return parsedValue;
}

export function normalizeCandidateAccessList(
  candidateAccessList,
  fallbackCandidateEmails = [],
) {
  const normalizeEntries = (entries) => {
    const uniqueEntries = new Map();

    entries.forEach((entry) => {
      const email =
        typeof entry === "string"
          ? normalizeEmail(entry)
          : normalizeEmail(entry?.email);

      if (!isValidEmail(email) || uniqueEntries.has(email)) {
        return;
      }

      uniqueEntries.set(email, {
        email,
        maxJoins: normalizeCandidateJoinLimit(entry?.maxJoins),
      });
    });

    return Array.from(uniqueEntries.values());
  };

  const normalizedAccessList = Array.isArray(candidateAccessList)
    ? normalizeEntries(candidateAccessList)
    : [];

  if (normalizedAccessList.length > 0) {
    return normalizedAccessList;
  }

  return normalizeEntries(
    splitCandidateEmails(fallbackCandidateEmails).map((email) => ({
      email,
      maxJoins: DEFAULT_CANDIDATE_MAX_JOINS,
    })),
  );
}

export function getInterviewCandidateAccessList(interview) {
  return normalizeCandidateAccessList(
    interview?.candidateAccessList,
    interview?.candidateEmails,
  );
}

export function getInterviewCandidateEmails(interview) {
  return getInterviewCandidateAccessList(interview).map(({ email }) => email);
}

export function getCandidateAccessEntry(interview, email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  return (
    getInterviewCandidateAccessList(interview).find(
      (entry) => entry.email === normalizedEmail,
    ) || null
  );
}

export function isCandidateAllowedForInterview(interview, email) {
  return Boolean(getCandidateAccessEntry(interview, email));
}

export function hasCandidateRemainingJoins(
  interview,
  email,
  completedJoinCount = 0,
) {
  const accessEntry = getCandidateAccessEntry(interview, email);
  if (!accessEntry) return false;

  return completedJoinCount < accessEntry.maxJoins;
}
