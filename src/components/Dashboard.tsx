import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProjectList } from "./ProjectList";
import { ActivityFeed } from "./ActivityFeed";
import { CreateProjectModal } from "./CreateProjectModal";
import { ProjectBoard } from "./ProjectBoard";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

export function Dashboard() {
  const projects = useQuery(api.projects.list);
  const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);

  if (projects === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedProjectId) {
    return (
      <ProjectBoard 
        projectId={selectedProjectId} 
        onBack={() => setSelectedProjectId(null)} 
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProjectList 
            projects={projects}
            onProjectSelect={setSelectedProjectId}
            onCreateProject={() => setShowCreateProject(true)}
          />
        </div>
        
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {showCreateProject && (
        <CreateProjectModal 
          isOpen={showCreateProject}
          onClose={() => setShowCreateProject(false)}
        />
      )}
    </div>
  );
}
