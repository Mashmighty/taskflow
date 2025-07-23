import express from 'express';

const router = express.Router();

// Mock projects data (replace with database in production)
let projects = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Redesigning the company website with modern UI/UX principles.',
    status: 'active',
    createdAt: new Date('2024-12-01'),
    dueDate: new Date('2025-01-30'),
    taskCount: 12
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Building a cross-platform mobile application for task management.',
    status: 'planning',
    createdAt: new Date('2024-12-15'),
    dueDate: new Date('2025-03-15'),
    taskCount: 8
  },
  {
    id: 3,
    name: 'API Integration',
    description: 'Integrating third-party APIs for enhanced functionality.',
    status: 'review',
    createdAt: new Date('2024-11-20'),
    dueDate: new Date('2025-02-10'),
    taskCount: 5
  }
];

// GET /api/projects - Get all projects
router.get('/', (req, res) => {
  try {
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects - Create new project
router.post('/', (req, res) => {
  try {
    const { name, description, dueDate } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const newProject = {
      id: Math.max(...projects.map(p => p.id)) + 1,
      name,
      description,
      status: 'planning',
      createdAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      taskCount: 0
    };

    projects.push(newProject);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { name, description, status, dueDate } = req.body;

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...(name && { name }),
      ...(description && { description }),
      ...(status && { status }),
      ...(dueDate && { dueDate: new Date(dueDate) })
    };

    res.json(projects[projectIndex]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    projects.splice(projectIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;