import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Check project access
    const project = await ctx.db.get(args.projectId);
    if (!project || (project.ownerId !== userId && !project.memberIds.includes(userId))) {
      return [];
    }

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return tickets.sort((a, b) => a.position - b.position);
  },
});

export const get = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) return null;

    // Check project access
    const project = await ctx.db.get(ticket.projectId);
    if (!project || (project.ownerId !== userId && !project.memberIds.includes(userId))) {
      return null;
    }

    return ticket;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
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
    assigneeId: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check project access
    const project = await ctx.db.get(args.projectId);
    if (!project || (project.ownerId !== userId && !project.memberIds.includes(userId))) {
      throw new Error("Project not found or access denied");
    }

    // Get next position
    const existingTickets = await ctx.db
      .query("tickets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    const maxPosition = Math.max(0, ...existingTickets.map(t => t.position));

    const ticketId = await ctx.db.insert("tickets", {
      title: args.title,
      description: args.description,
      status: args.status,
      priority: args.priority,
      projectId: args.projectId,
      assigneeId: args.assigneeId,
      creatorId: userId,
      dueDate: args.dueDate,
      tags: args.tags || [],
      position: maxPosition + 1,
    });

    // Create activity
    await ctx.db.insert("activities", {
      type: "ticket_created",
      userId,
      projectId: args.projectId,
      ticketId,
      details: `Created ticket "${args.title}"`,
    });

    // Notify assignee if different from creator
    if (args.assigneeId && args.assigneeId !== userId) {
      await ctx.db.insert("notifications", {
        userId: args.assigneeId,
        type: "ticket_assigned",
        title: "Ticket Assigned",
        message: `You've been assigned to ticket "${args.title}"`,
        isRead: false,
        relatedProjectId: args.projectId,
        relatedTicketId: ticketId,
      });
    }

    return ticketId;
  },
});

export const update = mutation({
  args: {
    ticketId: v.id("tickets"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("review"),
      v.literal("done")
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    assigneeId: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");

    // Check project access
    const project = await ctx.db.get(ticket.projectId);
    if (!project || (project.ownerId !== userId && !project.memberIds.includes(userId))) {
      throw new Error("Access denied");
    }

    const updates: any = {};
    const changes: string[] = [];

    if (args.title !== undefined && args.title !== ticket.title) {
      updates.title = args.title;
      changes.push(`title from "${ticket.title}" to "${args.title}"`);
    }
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined && args.status !== ticket.status) {
      updates.status = args.status;
      changes.push(`status from "${ticket.status}" to "${args.status}"`);
    }
    if (args.priority !== undefined && args.priority !== ticket.priority) {
      updates.priority = args.priority;
      changes.push(`priority from "${ticket.priority}" to "${args.priority}"`);
    }
    if (args.assigneeId !== undefined && args.assigneeId !== ticket.assigneeId) {
      updates.assigneeId = args.assigneeId;
      changes.push("assignee");
    }
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.tags !== undefined) updates.tags = args.tags;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.ticketId, updates);

      // Create activity
      await ctx.db.insert("activities", {
        type: "ticket_updated",
        userId,
        projectId: ticket.projectId,
        ticketId: args.ticketId,
        details: `Updated ticket "${ticket.title}": ${changes.join(", ")}`,
      });

      // Notify assignee if changed and different from updater
      if (args.assigneeId !== undefined && args.assigneeId !== userId && args.assigneeId !== ticket.assigneeId) {
        await ctx.db.insert("notifications", {
          userId: args.assigneeId,
          type: "ticket_assigned",
          title: "Ticket Assigned",
          message: `You've been assigned to ticket "${ticket.title}"`,
          isRead: false,
          relatedProjectId: ticket.projectId,
          relatedTicketId: args.ticketId,
        });
      }
    }

    return args.ticketId;
  },
});

export const updatePosition = mutation({
  args: {
    ticketId: v.id("tickets"),
    newPosition: v.number(),
    newStatus: v.optional(v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("review"),
      v.literal("done")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");

    // Check project access
    const project = await ctx.db.get(ticket.projectId);
    if (!project || (project.ownerId !== userId && !project.memberIds.includes(userId))) {
      throw new Error("Access denied");
    }

    const updates: any = { position: args.newPosition };
    if (args.newStatus !== undefined) {
      updates.status = args.newStatus;
    }

    await ctx.db.patch(args.ticketId, updates);

    // Create activity
    await ctx.db.insert("activities", {
      type: "ticket_moved",
      userId,
      projectId: ticket.projectId,
      ticketId: args.ticketId,
      details: `Moved ticket "${ticket.title}"${args.newStatus ? ` to ${args.newStatus}` : ""}`,
    });

    return args.ticketId;
  },
});
