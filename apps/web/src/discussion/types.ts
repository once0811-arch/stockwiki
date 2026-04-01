export type DiscussionThreadStatus = "open" | "resolved" | "locked";
export type DiscussionCommentStatus = "visible" | "reported";
export type DiscussionReportReason = "abuse" | "misinformation" | "spam";

export interface DiscussionThreadRecord {
  createdAt: string;
  createdBy: string;
  id: string;
  pageKey: string;
  pinned: boolean;
  sectionAnchor?: string;
  status: DiscussionThreadStatus;
  title: string;
  updatedAt: string;
}

export interface DiscussionCommentRecord {
  bodyHtml: string;
  bodyMarkdown: string;
  createdAt: string;
  createdBy: string;
  helpfulVoterIds: string[];
  id: string;
  parentCommentId?: string;
  status: DiscussionCommentStatus;
  threadId: string;
  updatedAt: string;
}

export interface DiscussionReportRecord {
  commentId: string;
  createdAt: string;
  id: string;
  reason: DiscussionReportReason;
  reporterUserId: string;
  status: "open" | "reviewed";
}

export interface DiscussionPreviewItem {
  id: string;
  replies: number;
  sectionAnchor?: string;
  status: DiscussionThreadStatus;
  summary: string;
  title: string;
}
