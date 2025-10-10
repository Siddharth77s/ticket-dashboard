import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Get or create user settings
    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      settings = {
        _id: "" as any,
        _creationTime: Date.now(),
        userId,
        isSuperUser: false,
        emailNotifications: true,
        theme: "light" as const,
        lastActiveAt: Date.now(),
      };
    }

    return {
      ...user,
      settings,
    };
  },
});

export const updateSettings = mutation({
  args: {
    emailNotifications: v.optional(v.boolean()),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      await ctx.db.insert("userSettings", {
        userId,
        isSuperUser: false,
        emailNotifications: args.emailNotifications ?? true,
        theme: args.theme ?? "light",
        lastActiveAt: Date.now(),
      });
    } else {
      const updates: any = { lastActiveAt: Date.now() };
      if (args.emailNotifications !== undefined) updates.emailNotifications = args.emailNotifications;
      if (args.theme !== undefined) updates.theme = args.theme;
      
      await ctx.db.patch(settings._id, updates);
    }

    return userId;
  },
});

export const toggleSuperUser = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Simple password check (in production, use proper hashing)
    const SUPER_USER_PASSWORD = "admin123"; // This should be an environment variable
    if (args.password !== SUPER_USER_PASSWORD) {
      throw new Error("Invalid password");
    }

    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      await ctx.db.insert("userSettings", {
        userId,
        isSuperUser: true,
        emailNotifications: true,
        theme: "light",
        lastActiveAt: Date.now(),
      });
    } else {
      await ctx.db.patch(settings._id, {
        isSuperUser: !settings.isSuperUser,
        lastActiveAt: Date.now(),
      });
    }

    return userId;
  },
});

export const listProjectMembers = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Check project access
    const project = await ctx.db.get(args.projectId);
    if (!project || (project.ownerId !== userId && !project.memberIds.includes(userId))) {
      return [];
    }

    // Get all member IDs including owner
    const allMemberIds = [project.ownerId, ...project.memberIds];
    
    // Fetch user details
    const members = await Promise.all(
      allMemberIds.map(async (memberId) => {
        const user = await ctx.db.get(memberId);
        return user ? {
          _id: user._id,
          name: user.name,
          email: user.email,
          isOwner: memberId === project.ownerId,
        } : null;
      })
    );

    return members.filter((member): member is NonNullable<typeof member> => member !== null);
  },
});
