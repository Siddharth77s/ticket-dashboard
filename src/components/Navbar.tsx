import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { Bell, Settings, Crown } from "lucide-react";
import { useState } from "react";
import { NotificationPanel } from "./NotificationPanel";
import { SuperUserToggle } from "./SuperUserToggle";

export function Navbar() {
  const user = useQuery(api.users.current);
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSuperUserToggle, setShowSuperUserToggle] = useState(false);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">ProjectFlow</h1>
            {user.settings?.isSuperUser && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                <Crown className="w-3 h-3" />
                <span>Super User</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              )}
            </div>

            <button
              onClick={() => setShowSuperUserToggle(!showSuperUserToggle)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      {showSuperUserToggle && (
        <SuperUserToggle 
          isOpen={showSuperUserToggle}
          onClose={() => setShowSuperUserToggle(false)}
          currentUser={user}
        />
      )}
    </header>
  );
}
