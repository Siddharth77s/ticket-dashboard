import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Crown, Shield } from "lucide-react";
import { toast } from "sonner";

interface SuperUserToggleProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export function SuperUserToggle({ isOpen, onClose, currentUser }: SuperUserToggleProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toggleSuperUser = useMutation(api.users.toggleSuperUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    try {
      await toggleSuperUser({ password: password.trim() });
      const newStatus = !currentUser.settings?.isSuperUser;
      toast.success(
        newStatus 
          ? "Super user mode enabled!" 
          : "Super user mode disabled!"
      );
      onClose();
      setPassword("");
    } catch (error) {
      toast.error("Invalid password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">Super User Access</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            currentUser.settings?.isSuperUser 
              ? "bg-yellow-50 text-yellow-800" 
              : "bg-gray-50 text-gray-600"
          }`}>
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">
              Status: {currentUser.settings?.isSuperUser ? "Super User Active" : "Regular User"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter admin password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Super users can access all projects and perform administrative actions
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim() || isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isLoading ? "Processing..." : (
                currentUser.settings?.isSuperUser ? "Disable" : "Enable"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
