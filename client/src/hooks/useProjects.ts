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

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.data.projects);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Create project
  const createProject = async (projectData: CreateProjectData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }

      const data = await response.json();
      setProjects(prev => [data.data.project, ...prev]);
      toast.success('Project created successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      toast.error(message);
      throw err;
    }
  };

  // Delete project
  const deleteProject = async (projectId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(prev => prev.filter(p => p._id !== projectId));
      toast.success('Project archived successfully');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    createProject,
    deleteProject,
    refetch: fetchProjects
  };
};