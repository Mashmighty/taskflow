import express from 'express';

const router = express.Router();

// Mock tasks data (replace with database in production)
let tasks = [
  {
    id: 1,
    title: 'Design homepage mockup',
    description: 'Create wireframes and mockups for the new homepage design',
    status: 'completed',
    priority: 'high',
    projectId: 1,
    assignedTo: 'John Doe',
    createdAt: new Date('2024-12-01'),
    dueDate: new Date('2024-12-15'),
    completedAt: new Date('2024-12-14')
  },
  {
    id: 2,
    title: 'Implement user authentication',
    description: 'Set up login/logout functionality with JWT tokens',
    status: 'in-progress',
    priority: 'high',
    projectId: 1,
    assignedTo: 'Jane Smith',
    createdAt: new Date('2024-12-05'),
    dueDate: new Date('2025-01-10'),
    completedAt: null
  },
  {
    id: 3,
    title: 'Setup database schema',
    description: 'Create database tables and relationships',
    status: 'todo',
    priority: 'medium',
    projectId: 2,
    assignedTo: 'Mike Johnson',
    createdAt: new Date('2024-12-10'),
    dueDate: new Date('2025-01-20'),
    completedAt: null
  },
  {
    id: 4,
    title: 'Write API documentation',
    description: 'Document all API endpoints with examples',
    status: 'overdue',
    priority: 'low',
    projectId: 3,
    assignedTo: 'Sarah Wilson',
    createdAt: new Date('2024-11-25'),
    dueDate: new Date('2024-12-20'),
    completedAt: null
  }
];

// GET /api/tasks - Get all tasks with optional filtering
router.get('/', (req, res) => {
  try {
    const { status, projectId, priority } = req.query;
    let filteredTasks = [...tasks];

    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }

    if (projectId) {
      filteredTasks = filteredTasks.filter(task => task.projectId === parseInt(projectId as string));
    }

    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }

    res.json(filteredTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tasks - Create new task
router.post('/', (req, res) => {
  try {
    const { title, description, projectId, priority, assignedTo, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: 'Title and projectId are required' });
    }

    const newTask = {
      id: Math.max(...tasks.map(t => t.id)) + 1,
      title,
      description: description || '',
      status: 'todo',
      priority: priority || 'medium',
      projectId: parseInt(projectId),
      assignedTo: assignedTo || '',
      createdAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      completedAt: null
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    // If status is being changed to completed, set completedAt
    const completedAt = status === 'completed' && tasks[taskIndex].status !== 'completed' 
      ? new Date() 
      : status !== 'completed' 
        ? null 
        : tasks[taskIndex].completedAt;

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      completedAt
    };

    res.json(tasks[taskIndex]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tasks/stats - Get task statistics
router.get('/stats/summary', (req, res) => {
  try {
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      overdue: tasks.filter(t => t.status === 'overdue').length,
      todo: tasks.filter(t => t.status === 'todo').length
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;