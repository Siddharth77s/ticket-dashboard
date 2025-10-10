import { Calendar, User, AlertCircle } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface Ticket {
  _id: Id<"tickets">;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  projectId: Id<"projects">;
  assigneeId?: Id<"users">;
  creatorId: Id<"users">;
  dueDate?: number;
  tags: string[];
  position: number;
  _creationTime: number;
}

interface Member {
  _id: Id<"users">;
  name?: string;
  email?: string;
  isOwner: boolean;
}

interface TicketCardProps {
  ticket: Ticket;
  members: Member[];
}

export function TicketCard({ ticket, members }: TicketCardProps) {
  const assignee = ticket.assigneeId 
    ? members.find(m => m._id === ticket.assigneeId)
    : null;

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  const isOverdue = ticket.dueDate && ticket.dueDate < Date.now() && ticket.status !== "done";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{ticket.title}</h4>
        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>

      {ticket.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{ticket.description}</p>
      )}

      {ticket.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {ticket.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
          {ticket.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{ticket.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          {assignee && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{assignee.name || assignee.email}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {ticket.dueDate && (
            <div className={`flex items-center space-x-1 ${isOverdue ? "text-red-600" : ""}`}>
              <Calendar className="w-3 h-3" />
              <span>{new Date(ticket.dueDate).toLocaleDateString()}</span>
              {isOverdue && <AlertCircle className="w-3 h-3" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
