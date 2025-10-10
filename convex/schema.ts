import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    ownerId: v.id("users"),
    memberIds: v.array(v.id("users")),
    isArchived: v.boolean(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_member", ["memberIds"]),

  tickets: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("review"),
      v.literal("done")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    projectId: v.id("projects"),
    assigneeId: v.optional(v.id("users")),
    creatorId: v.id("users"),
    dueDate: v.optional(v.number()),
    tags: v.array(v.string()),
    position: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_assignee", ["assigneeId"])
    .index("by_creator", ["creatorId"])
    .index("by_status", ["status"]),

  activities: defineTable({
    type: v.union(
      v.literal("ticket_created"),
      v.literal("ticket_updated"),
      v.literal("ticket_moved"),
      v.literal("ticket_assigned"),
      v.literal("project_created"),
      v.literal("project_updated"),
      v.literal("member_added"),
      v.literal("member_removed")
    ),
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    ticketId: v.optional(v.id("tickets")),
    details: v.string(),
    metadata: v.optional(v.object({
      oldValue: v.optional(v.string()),
      newValue: v.optional(v.string()),
      field: v.optional(v.string()),
    })),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_ticket", ["ticketId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("ticket_assigned"),
      v.literal("ticket_updated"),
      v.literal("project_invitation"),
      v.literal("activity_digest")
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedProjectId: v.optional(v.id("projects")),
    relatedTicketId: v.optional(v.id("tickets")),
    metadata: v.optional(v.object({
      emailSent: v.optional(v.boolean()),
      emailSentAt: v.optional(v.number()),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),

  userSettings: defineTable({
    userId: v.id("users"),
    isSuperUser: v.boolean(),
    emailNotifications: v.boolean(),
    theme: v.union(v.literal("light"), v.literal("dark")),
    lastActiveAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_super_user", ["isSuperUser"]),

  otpCodes: defineTable({
    email: v.string(),
    code: v.string(),
    expiresAt: v.number(),
    isUsed: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_code", ["code"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
