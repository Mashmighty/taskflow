import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

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

interface CreateProjectData {
  name: string;
  key: string;
  description?: string;
  endDate?: string;
}

const generateSampleProjects = (): Project[] => {
  return [
    {
      _id: 'project-1',
      name: 'TaskFlow Development',
      description: 'Building a modern project management application with React and Node.js',
      key: 'TASK',
      owner: {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: undefined
      },
      members: [
        { _id: '1', name: 'John Doe', email: 'john@example.com' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { _id: '3', name: 'Bob Johnson', email: 'bob@example.com' }
      ],
      status: 'active',
      createdAt: '2025-07-20T10:00:00Z',
      updatedAt: '2025-07-26T15:30:00Z'
    },
    {
      _id: 'project-2',
      name: 'E-commerce Platform',
      description: 'Building a full-stack e-commerce solution with payment integration',
      key: 'ECOM',
      owner: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      members: [
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { _id: '4', name: 'Alice Wilson', email: 'alice@example.com' }
      ],
      status: 'active',
      createdAt: '2025-07-15T09:00:00Z',
      updatedAt: '2025-07-25T14:20:00Z'
    },
    {
      _id: 'project-3',
      name: 'Mobile App Design',
      description: 'Designing the UI/UX for our mobile application',
      key: 'MOB',
      owner: {
        name: 'Bob Johnson',
        email: 'bob@example.com'
      },
      members: [
        { _id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
        { _id: '5', name: 'Charlie Brown', email: 'charlie@example.com' }
      ],
      status: 'completed',
      createdAt: '2025-07-10T08:00:00Z',
      updatedAt: '2025-07-24T16:45:00Z'
    }
  ];
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSampleData = async () => {
      setLoading(true);
      setTimeout(() => {
        try {
          setProjects(generateSampleProjects());
          setError(null);
        } catch (err) {
          setError('Failed to load projects');
        } finally {
          setLoading(false);
        }
      }, 500);
    };

    loadSampleData();
  }, []);

  const createProject = async (projectData: CreateProjectData) => {
    try {
      const newProject: Project = {
        _id: `project-${Date.now()}`,
        name: projectData.name,
        description: projectData.description || '',
        key: projectData.key,
        owner: {
          name: 'Current User',
          email: 'current@example.com'
        },
        members: [
          { _id: 'current', name: 'Current User', email: 'current@example.com' }
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setProjects(prev => [newProject, ...prev]);
      toast.success('Project created successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      toast.error(message);
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      setProjects(prev => prev.filter(p => p._id !== projectId));
      toast.success('Project archived successfully');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    deleteProject,
    refetch: () => {
      setLoading(true);
      setTimeout(() => {
        setProjects(generateSampleProjects());
        setLoading(false);
      }, 500);
    }
  };
};