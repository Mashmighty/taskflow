import { Response } from 'express';
import Task, { TaskStatus } from '../models/task';
import Project from '../models/project';
import { AuthRequest } from '../middleware/auth';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, status, assignee } = req.query;
    const userId = req.user!._id;

    // Build filter
    const filter: any = {};
    
    if (projectId) {
      // Verify user has access to this project
      const project = await Project.findOne({
        _id: projectId,
        $or: [
          { owner: userId },
          { members: userId }
        ]
      });

      if (!project) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this project'
        });
      }

      filter.project = projectId;
    } else {
      // Get all projects user has access to
      const projects = await Project.find({
        $or: [
          { owner: userId },
          { members: userId }
        ]
      }).select('_id');

      filter.project = { $in: projects.map(p => p._id) };
    }

    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate('project', 'name key')
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ position: 1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        tasks
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};

export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const task = await Task.findById(id)
      .populate('project', 'name key')
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify user has access to this task's project
    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: userId },
        { members: userId }
      ]
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    res.json({
      success: true,
      data: {
        task
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      title, 
      description, 
      type, 
      priority, 
      projectId, 
      assigneeId, 
      estimatedHours,
      storyPoints,
      tags,
      dueDate 
    } = req.body;
    const userId = req.user!._id;

    // Verify user has access to this project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: userId },
        { members: userId }
      ]
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    // Get the next position for this project and status
    const lastTask = await Task.findOne({ 
      project: projectId, 
      status: TaskStatus.TODO 
    }).sort({ position: -1 });

    const position = lastTask ? lastTask.position + 1 : 0;

    const task = new Task({
      title,
      description,
      type,
      priority,
      project: projectId,
      assignee: assigneeId,
      reporter: userId,
      estimatedHours,
      storyPoints,
      tags: tags || [],
      dueDate,
      position
    });

    await task.save();
    await task.populate('project', 'name key');
    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user!._id;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify user has access to this task's project
    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: userId },
        { members: userId }
      ]
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'type', 'priority', 'status', 
      'assignee', 'estimatedHours', 'actualHours', 'storyPoints', 
      'tags', 'dueDate'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        (task as any)[field] = updateData[field];
      }
    });

    await task.save();
    await task.populate('project', 'name key');
    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify user has access to this task's project
    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: userId },
        { members: userId }
      ]
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    await Task.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};

export const updateTaskPosition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, position } = req.body;
    const userId = req.user!._id;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify user has access to this task's project
    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: userId },
        { members: userId }
      ]
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    // Update positions of other tasks in the same status
    if (status && status !== task.status) {
      // Moving to different status
      await Task.updateMany(
        { 
          project: task.project, 
          status: status, 
          position: { $gte: position } 
        },
        { $inc: { position: 1 } }
      );

      // Reorder old status
      await Task.updateMany(
        { 
          project: task.project, 
          status: task.status, 
          position: { $gt: task.position } 
        },
        { $inc: { position: -1 } }
      );

      task.status = status;
    } else {
      // Moving within same status
      if (position > task.position) {
        // Moving down
        await Task.updateMany(
          { 
            project: task.project, 
            status: task.status, 
            position: { $gt: task.position, $lte: position } 
          },
          { $inc: { position: -1 } }
        );
      } else {
        // Moving up
        await Task.updateMany(
          { 
            project: task.project, 
            status: task.status, 
            position: { $gte: position, $lt: task.position } 
          },
          { $inc: { position: 1 } }
        );
      }
    }

    task.position = position;
    await task.save();

    await task.populate('project', 'name key');
    await task.populate('assignee', 'name email avatar');
    await task.populate('reporter', 'name email avatar');

    res.json({
      success: true,
      message: 'Task position updated successfully',
      data: {
        task
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update task position',
      error: error.message
    });
  }
};

export const getTasksByStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!._id;

    // Verify user has access to this project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: userId },
        { members: userId }
      ]
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ position: 1 });

    // Group tasks by status
    const tasksByStatus = {
      [TaskStatus.TODO]: tasks.filter(task => task.status === TaskStatus.TODO),
      [TaskStatus.IN_PROGRESS]: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
      [TaskStatus.IN_REVIEW]: tasks.filter(task => task.status === TaskStatus.IN_REVIEW),
      [TaskStatus.DONE]: tasks.filter(task => task.status === TaskStatus.DONE)
    };

    res.json({
      success: true,
      data: {
        tasksByStatus,
        project
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks by status',
      error: error.message
    });
  }
};