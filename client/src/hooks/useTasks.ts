import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Task, TaskStatus } from '../pages/TaskBoard';

interface CreateTaskData {
  title: string;
  description?: string;
  type: 'TASK' | 'BUG' | 'STORY' | 'EPIC';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  projectId: string;
  assigneeId?: string;
  estimatedHours?: number;
  storyPoints?: number;
  tags: string[];
  dueDate?: string;
}

interface TasksByStatus {
  [TaskStatus.TODO]: Task[];
  [TaskStatus.IN_PROGRESS]: Task[];
  [TaskStatus.IN_REVIEW]: Task[];
  [TaskStatus.DONE]: Task[];
}

export const useTasks = (projectId: string) => {
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>({
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.IN_REVIEW]: [],
    [TaskStatus.DONE]: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch tasks by status
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/tasks/project/${projectId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasksByStatus(data.data.tasksByStatus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const createTask = async (taskData: CreateTaskData) => {
    try {
      const token = localStorage.getItem('token');