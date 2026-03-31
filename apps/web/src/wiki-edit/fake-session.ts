import type { PageProtectionLevel, UserRole } from "@stockwiki/domain";

export interface FakeSession {
  displayName: string;
  role: UserRole;
  userId: string;
}

export type EditAccessMode =
  | "login_required"
  | "needs_contributor"
  | "needs_trusted_contributor"
  | "needs_reviewer"
  | "can_edit";

export interface EditAccessResult {
  message: string;
  mode: EditAccessMode;
}

const fakeSessions: Record<string, FakeSession> = {
  "member-1": {
    displayName: "Member Demo",
    role: "member",
    userId: "member-1"
  },
  "contributor-1": {
    displayName: "Contributor Demo",
    role: "contributor",
    userId: "contributor-1"
  },
  "trusted-contributor-1": {
    displayName: "Trusted Contributor Demo",
    role: "trusted_contributor",
    userId: "trusted-contributor-1"
  },
  "reviewer-1": {
    displayName: "Reviewer Demo",
    role: "reviewer",
    userId: "reviewer-1"
  }
};

const roleRank: Record<UserRole, number> = {
  reader: 1,
  member: 2,
  contributor: 3,
  trusted_contributor: 4,
  reviewer: 5,
  moderator: 6,
  admin: 7
};

export function getFakeSession(actor?: string): FakeSession | null {
  if (!actor) {
    return null;
  }

  return fakeSessions[actor] ?? null;
}

export function evaluateEditAccess(
  session: FakeSession | null,
  protectionLevel: PageProtectionLevel
): EditAccessResult {
  if (!session) {
    return {
      message: "Sign in to start an edit proposal.",
      mode: "login_required"
    };
  }

  if (protectionLevel === "open") {
    if (hasFakeRole(session.role, "contributor")) {
      return {
        message: "Contributor access granted.",
        mode: "can_edit"
      };
    }

    return {
      message: "Contributor onboarding and community rules are required before editing.",
      mode: "needs_contributor"
    };
  }

  if (protectionLevel === "semi_protected") {
    if (hasFakeRole(session.role, "trusted_contributor")) {
      return {
        message: "Trusted contributor access granted.",
        mode: "can_edit"
      };
    }

    return {
      message: "This page is semi-protected. Trusted contributor access is required.",
      mode: "needs_trusted_contributor"
    };
  }

  if (protectionLevel === "reviewer_only" || protectionLevel === "locked") {
    if (hasFakeRole(session.role, "reviewer")) {
      return {
        message: "Reviewer access granted.",
        mode: "can_edit"
      };
    }

    return {
      message: "Reviewer access is required for this page.",
      mode: "needs_reviewer"
    };
  }

  return {
    message: "Contributor access granted.",
    mode: "can_edit"
  };
}

export function hasFakeRole(candidate: UserRole, required: UserRole): boolean {
  return roleRank[candidate] >= roleRank[required];
}
