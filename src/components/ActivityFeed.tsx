import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Clock, User } from "lucide-react";

export function ActivityFeed() {
  const activities = useQuery(api.activities.listRecent, { limit: 10 });

  if (activities === undefined) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity._id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user?.name || "Unknown User"}</span>
                  {" "}
                  <span className="text-gray-600">{activity.details}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  {activity.project && (
                    <span 
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: getColorValue(activity.project.color) }}
                    ></span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(activity._creationTime)}
                  </span>
                  {activity.project && (
                    <span className="text-xs text-gray-500">
                      in {activity.project.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getColorValue(color: string): string {
  const colors: Record<string, string> = {
    blue: "#3b82f6",
    green: "#10b981",
    purple: "#8b5cf6",
    red: "#ef4444",
    yellow: "#f59e0b",
    indigo: "#6366f1",
    pink: "#ec4899",
    gray: "#6b7280",
  };
  return colors[color] || colors.gray;
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
