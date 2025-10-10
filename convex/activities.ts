import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByProject = query({
  args: { 
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Check project access
    const project = await ctx.db.get(args.projectId);
    if (!project || (project.ownerId !== userId && !project.memberIds.includes(userId))) {
      return [];
    }

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(args.limit || 50);

    // Enrich with user data
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        return {
          ...activity,
          user: user ? { name: user.name, email: user.email } : null,
        };
      })
    );

    return enrichedActivities;
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get user's projects
    const allProjects = await ctx.db.query("projects").collect();
    const projects = allProjects.filter(project => 
      project.ownerId === userId || project.memberIds.includes(userId)
    );

    const projectIds = projects.map(p => p._id);

    if (projectIds.length === 0) return [];

    // Get recent activities from user's projects
    const activities = await ctx.db
      .query("activities")
      .filter((q) => 
        q.and(
          q.neq(q.field("projectId"), undefined),
          q.or(...projectIds.map(id => q.eq(q.field("projectId"), id)))
        )
      )
      .order("desc")
      .take(args.limit || 20);

    // Enrich with user and project data
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.userId);
        const project = activity.projectId ? await ctx.db.get(activity.projectId) : null;
        return {
          ...activity,
          user: user ? { name: user.name, email: user.email } : null,
          project: project ? { name: project.name, color: project.color } : null,
        };
      })
    );

    return enrichedActivities;
  },
});
