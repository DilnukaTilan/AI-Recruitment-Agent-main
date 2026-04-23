const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export function getInterviewCandidateEmails(interview) {
  return normalizeCandidateEmails(interview?.candidateEmails);
}

export function isCandidateAllowedForInterview(interview, email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;

  const candidateEmails = getInterviewCandidateEmails(interview);
  if (candidateEmails.length === 0) return false;

  return candidateEmails.includes(normalizedEmail);
}
