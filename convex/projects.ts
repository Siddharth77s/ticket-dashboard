import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allProjects = await ctx.db.query("projects").collect();
    const projects = allProjects.filter(project => 
      (project.ownerId === userId || project.memberIds.includes(userId)) && 
      !project.isArchived
    );

    return projects;
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // Check if user has access to this project
    if (project.ownerId !== userId && !project.memberIds.includes(userId)) {
      return null;
    }

    return project;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      color: args.color,
      ownerId: userId,
      memberIds: [],
      isArchived: false,
    });

    // Create activity
    await ctx.db.insert("activities", {
      type: "project_created",
      userId,
      projectId,
      details: `Created project "${args.name}"`,
    });

    return projectId;
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== userId) {
      throw new Error("Project not found or access denied");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.color !== undefined) updates.color = args.color;

    await ctx.db.patch(args.projectId, updates);

    // Create activity
    await ctx.db.insert("activities", {
      type: "project_updated",
      userId,
      projectId: args.projectId,
      details: `Updated project "${project.name}"`,
    });

    return args.projectId;
  },
});

export const addMember = mutation({
  args: {
    projectId: v.id("projects"),
    memberEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== userId) {
      throw new Error("Project not found or access denied");
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.memberEmail))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (project.memberIds.includes(user._id)) {
      throw new Error("User is already a member");
    }

    await ctx.db.patch(args.projectId, {
      memberIds: [...project.memberIds, user._id],
    });

    // Create activity
    await ctx.db.insert("activities", {
      type: "member_added",
      userId,
      projectId: args.projectId,
      details: `Added ${args.memberEmail} to the project`,
    });

    // Create notification for the new member
    await ctx.db.insert("notifications", {
      userId: user._id,
      type: "project_invitation",
      title: "Added to Project",
      message: `You've been added to project "${project.name}"`,
      isRead: false,
      relatedProjectId: args.projectId,
    });

    return args.projectId;
  },
});
