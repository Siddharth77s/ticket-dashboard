import { Plus } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { TicketCard } from "./TicketCard";

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

interface TicketColumnProps {
  title: string;
  status: "todo" | "in-progress" | "review" | "done";
  color: string;
  tickets: Ticket[];
  projectId: Id<"projects">;
  members: Member[];
}

export function TicketColumn({ title, status, color, tickets, projectId, members }: TicketColumnProps) {
  return (
    <div className="flex flex-col h-full">
      <div className={`${color} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full">
            {tickets.length}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 min-h-96">
        {tickets
          .sort((a, b) => a.position - b.position)
          .map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              members={members}
            />
          ))}
        
        {tickets.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No tickets</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
