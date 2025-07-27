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
      
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      const data = await response.json();
      const newTask = data.data.task;
      
      // Add task to local state
      setTasksByStatus(prev => ({
        ...prev,
        [TaskStatus.TODO]: [...prev[TaskStatus.TODO], newTask]
      }));
      
      toast.success('Task created successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      toast.error(message);
      throw err;
    }
  };

  // Update task
  const updateTask = async (taskId: string, updateData: Partial<Task>) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const data = await response.json();
      const updatedTask = data.data.task;
      
      // Update task in local state
      setTasksByStatus(prev => {
        const newState = { ...prev };
        
        // Remove from old status
        Object.keys(newState).forEach(status => {
          newState[status as TaskStatus] = newState[status as TaskStatus].filter(
            task => task._id !== taskId
          );
        });
        
        // Add to new status
        newState[updatedTask.status].push(updatedTask);
        
        return newState;
      });
      
      toast.success('Task updated successfully!');
    } catch (err) {
      toast.error('Failed to update task');
      throw err;
    }
  };

  // Update task position (for drag & drop)
  const updateTaskPosition = async (taskId: string, newStatus: TaskStatus, newPosition: number) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/tasks/${taskId}/position`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, position: newPosition })
      });

      if (!response.ok) {
        throw new Error('Failed to update task position');
      }

      const data = await response.json();
      const updatedTask = data.data.task;
      
      // Optimistically update local state
      setTasksByStatus(prev => {
        const newState = { ...prev };
        
        // Remove task from all statuses
        Object.keys(newState).forEach(status => {
          newState[status as TaskStatus] = newState[status as TaskStatus].filter(
            task => task._id !== taskId
          );
        });
        
        // Add to new status at correct position
        const tasksInNewStatus = [...newState[newStatus]];
        tasksInNewStatus.splice(newPosition, 0, updatedTask);
        newState[newStatus] = tasksInNewStatus;
        
        return newState;
      });
      
    } catch (err) {
      toast.error('Failed to move task');
      // Refresh tasks to get correct state
      fetchTasks();
      throw err;
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Remove from local state
      setTasksByStatus(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(status => {
          newState[status as TaskStatus] = newState[status as TaskStatus].filter(
            task => task._id !== taskId
          );
        });
        return newState;
      });
      
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  return {
    tasksByStatus,
    loading,
    error,
    createTask,
    updateTask,
    updateTaskPosition,
    deleteTask,
    refetch: fetchTasks
  };
};