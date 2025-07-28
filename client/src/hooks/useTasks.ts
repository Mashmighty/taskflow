import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { TaskStatus, TaskPriority, TaskType, Task } from '../pages/TaskBoard';

interface TasksByStatus {
  [TaskStatus.TODO]: Task[];
  [TaskStatus.IN_PROGRESS]: Task[];
  [TaskStatus.IN_REVIEW]: Task[];
  [TaskStatus.DONE]: Task[];
}

const generateSampleTasks = (): TasksByStatus => {
  const sampleTasks: Task[] = [
    {
      _id: '1',
      title: 'Design user authentication flow',
      description: 'Create wireframes and mockups for login and registration pages with modern UI patterns',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      type: TaskType.STORY,
      reporter: { _id: '1', name: 'John Doe', email: 'john@example.com' },
      assignee: { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      estimatedHours: 8,
      storyPoints: 5,
      tags: ['design', 'auth', 'ui', 'wireframes'],
      dueDate: '2025-08-01',
      position: 0,
      createdAt: '2025-07-26T10:00:00Z',
      updatedAt: '2025-07-26T10:00:00Z'
    },
    {
      _id: '2',
      title: 'Fix login validation bug',
      description: 'Users can submit empty forms without proper validation errors being displayed',
      status: TaskStatus.TODO,
      priority: TaskPriority.CRITICAL,
      type: TaskType.BUG,
      reporter: { _id: '1', name: 'John Doe', email: 'john@example.com' },
      estimatedHours: 2,
      tags: ['bug', 'validation', 'urgent', 'frontend'],
      dueDate: '2025-07-28',
      position: 1,
      createdAt: '2025-07-26T11:00:00Z',
      updatedAt: '2025-07-26T11:00:00Z'
    },
    {
      _id: '3',
      title: 'Set up project documentation',
      description: 'Create comprehensive README with setup instructions and API documentation',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      type: TaskType.TASK,
      reporter: { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      assignee: { _id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      estimatedHours: 4,
      storyPoints: 2,
      tags: ['documentation', 'setup', 'readme'],
      position: 2,
      createdAt: '2025-07-26T12:00:00Z',
      updatedAt: '2025-07-26T12:00:00Z'
    },
    {
      _id: '4',
      title: 'Implement drag & drop functionality',
      description: 'Add @dnd-kit to the task board for smooth drag and drop interactions between columns',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      type: TaskType.TASK,
      reporter: { _id: '1', name: 'John Doe', email: 'john@example.com' },
      assignee: { _id: '1', name: 'John Doe', email: 'john@example.com' },
      estimatedHours: 12,
      actualHours: 6,
      storyPoints: 8,
      tags: ['frontend', 'dnd', 'feature', 'react'],
      position: 0,
      createdAt: '2025-07-25T14:00:00Z',
      updatedAt: '2025-07-26T12:00:00Z'
    },
    {
      _id: '5',
      title: 'Optimize database queries',
      description: 'Review and optimize slow database queries affecting the project dashboard performance',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      type: TaskType.TASK,
      reporter: { _id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      assignee: { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      estimatedHours: 6,
      actualHours: 3,
      storyPoints: 5,
      tags: ['backend', 'database', 'performance', 'optimization'],
      position: 1,
      createdAt: '2025-07-25T16:00:00Z',
      updatedAt: '2025-07-26T13:00:00Z'
    },
    {
      _id: '6',
      title: 'Code review for API endpoints',
      description: 'Review and test all CRUD operations for tasks and projects endpoints',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      type: TaskType.TASK,
      reporter: { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      assignee: { _id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      estimatedHours: 4,
      actualHours: 3,
      tags: ['backend', 'review', 'api', 'testing'],
      position: 0,
      createdAt: '2025-07-24T09:00:00Z',
      updatedAt: '2025-07-26T13:00:00Z'
    },
    {
      _id: '7',
      title: 'User acceptance testing',
      description: 'Conduct UAT for the new project management features with stakeholders',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      type: TaskType.STORY,
      reporter: { _id: '1', name: 'John Doe', email: 'john@example.com' },
      assignee: { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      estimatedHours: 8,
      actualHours: 5,
      storyPoints: 3,
      tags: ['testing', 'uat', 'stakeholders', 'validation'],
      dueDate: '2025-07-30',
      position: 1,
      createdAt: '2025-07-23T11:00:00Z',
      updatedAt: '2025-07-26T14:00:00Z'
    },
    {
      _id: '8',
      title: 'Initial project setup',
      description: 'Set up the initial project structure with React, TypeScript, and build configuration',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      type: TaskType.TASK,
      reporter: { _id: '1', name: 'John Doe', email: 'john@example.com' },
      assignee: { _id: '1', name: 'John Doe', email: 'john@example.com' },
      estimatedHours: 4,
      actualHours: 3,
      storyPoints: 3,
      tags: ['setup', 'configuration', 'react', 'typescript'],
      position: 0,
      createdAt: '2025-07-20T09:00:00Z',
      updatedAt: '2025-07-22T16:00:00Z'
    },
    {
      _id: '9',
      title: 'Deploy to production',
      description: 'Configure and deploy the application to production environment with monitoring',
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      type: TaskType.TASK,
      reporter: { _id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      assignee: { _id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      estimatedHours: 6,
      actualHours: 8,
      storyPoints: 5,
      tags: ['deployment', 'production', 'monitoring', 'devops'],
      position: 1,
      createdAt: '2025-07-21T10:00:00Z',
      updatedAt: '2025-07-23T18:00:00Z'
    }
  ];

  return {
    [TaskStatus.TODO]: sampleTasks.filter(task => task.status === TaskStatus.TODO),
    [TaskStatus.IN_PROGRESS]: sampleTasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
    [TaskStatus.IN_REVIEW]: sampleTasks.filter(task => task.status === TaskStatus.IN_REVIEW),
    [TaskStatus.DONE]: sampleTasks.filter(task => task.status === TaskStatus.DONE)
  };
};

export const useTasks = (projectId: string) => {
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>({
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.IN_REVIEW]: [],
    [TaskStatus.DONE]: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = () => {
      if (!projectId) return;
      
      setLoading(true);
      setTimeout(() => {
        setTasksByStatus(generateSampleTasks());
        setLoading(false);
      }, 800);
    };

    loadTasks();
  }, [projectId]);

  const createTask = async (taskData: any) => {
    try {
      const newTask: Task = {
        _id: Date.now().toString(),
        title: taskData.title,
        description: taskData.description || '',
        status: TaskStatus.TODO,
        priority: taskData.priority,
        type: taskData.type,
        reporter: { _id: '1', name: 'Current User', email: 'user@example.com' },
        estimatedHours: taskData.estimatedHours,
        storyPoints: taskData.storyPoints,
        tags: taskData.tags || [],
        dueDate: taskData.dueDate,
        position: tasksByStatus[TaskStatus.TODO].length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTasksByStatus(prev => ({
        ...prev,
        [TaskStatus.TODO]: [...prev[TaskStatus.TODO], newTask]
      }));

      toast.success('Task created successfully!');
    } catch (err) {
      toast.error('Failed to create task');
      throw err;
    }
  };

  const updateTaskPosition = async (taskId: string, newStatus: TaskStatus, newPosition: number) => {
    try {
      setTasksByStatus(prev => {
        const newState = { ...prev };
        let taskToMove: Task | null = null;
        
        // Remove task from current status
        Object.keys(newState).forEach(status => {
          const statusKey = status as TaskStatus;
          const taskIndex = newState[statusKey].findIndex(task => task._id === taskId);
          if (taskIndex !== -1) {
            taskToMove = { ...newState[statusKey][taskIndex], status: newStatus };
            newState[statusKey].splice(taskIndex, 1);
          }
        });
        
        // Add task to new status
        if (taskToMove) {
          newState[newStatus].splice(newPosition, 0, taskToMove);
        }
        
        return newState;
      });

      toast.success(`Task moved to ${newStatus.replace('_', ' ').toLowerCase()}`);
    } catch (err) {
      toast.error('Failed to move task');
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setTasksByStatus(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(status => {
          const statusKey = status as TaskStatus;
          newState[statusKey] = newState[statusKey].filter(task => task._id !== taskId);
        });
        return newState;
      });

      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  return {
    tasksByStatus,
    loading,
    error,
    createTask,
    updateTaskPosition,
    deleteTask,
    refetch: () => setTasksByStatus(generateSampleTasks())
  };
};