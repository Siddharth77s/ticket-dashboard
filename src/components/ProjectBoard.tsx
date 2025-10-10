import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowLeft, Plus, Users, Settings } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { TicketColumn } from "./TicketColumn";
import { CreateTicketModal } from "./CreateTicketModal";
import { useState } from "react";

interface ProjectBoardProps {
  projectId: Id<"projects">;
  onBack: () => void;
}

export function ProjectBoard({ projectId, onBack }: ProjectBoardProps) {
  const project = useQuery(api.projects.get, { projectId });
  const tickets = useQuery(api.tickets.listByProject, { projectId });
  const members = useQuery(api.users.listProjectMembers, { projectId });
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  if (project === undefined || tickets === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to projects
          </button>
        </div>
      </div>
    );
  }

  const columns = [
    { id: "todo", title: "To Do", color: "bg-gray-100" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-100" },
    { id: "review", title: "Review", color: "bg-yellow-100" },
    { id: "done", title: "Done", color: "bg-green-100" },
  ];

  const ticketsByStatus = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.status]) acc[ticket.status] = [];
    acc[ticket.status].push(ticket);
    return acc;
  }, {} as Record<string, typeof tickets>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to projects</span>
            </button>
            <div className="flex items-center space-x-3">
              <div 
                className={`w-4 h-4 rounded-full bg-${project.color}-500`}
              ></div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{members?.length || 0} members</span>
            </div>
            <button
              onClick={() => setShowCreateTicket(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </button>
          </div>
        </div>
        
        {project.description && (
          <p className="text-gray-600 mt-2">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <TicketColumn
            key={column.id}
            title={column.title}
            status={column.id as any}
            color={column.color}
            tickets={ticketsByStatus[column.id] || []}
            projectId={projectId}
            members={members || []}
          />
        ))}
      </div>

      {showCreateTicket && (
        <CreateTicketModal
          isOpen={showCreateTicket}
          onClose={() => setShowCreateTicket(false)}
          projectId={projectId}
          members={members || []}
        />
      )}
    </div>
  );
}
