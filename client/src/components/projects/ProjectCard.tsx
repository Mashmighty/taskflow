import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MoreVertical, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../ui/Button';

interface Project {
  _id: string;
  name: string;
  description: string;
  key: string;
  owner: {
    name: string;
    email: string;
    avatar?: string;
  };
  members: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  status: 'active' | 'archived' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {project.key}
              </span>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical size={16} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                    <Edit size={16} />
                    Edit Project
                  </button>
                  <button
                    onClick={() => onDelete(project._id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <Trash2 size={16} />
                    Delete Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
          
          <div className="text-xs text-gray-500">
            Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}
          </div>
        </div>

        {/* Members */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">{project.members.length} members</span>
          </div>
          
          <div className="flex -space-x-2">
            {project.members.slice(0, 3).map((member) => (
              <div
                key={member._id}
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                title={member.name}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {project.members.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                +{project.members.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <Link to={`/projects/${project._id}`}>
          <Button variant="ghost" size="sm" className="w-full">
            View Project
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;