import { Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId }
      ],
      status: { $ne: 'archived' }
    })
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: {
        projects
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const project = await Project.findOne({
      _id: id,
      $or: [
        { owner: userId },
        { members: userId }
      ]
    })
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get project tasks
    const tasks = await Task.find({ project: id })
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort({ position: 1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        project,
        tasks
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, key, endDate } = req.body;
    const userId = req.user!._id;

    // Check if project key already exists
    const existingProject = await Project.findOne({ key });
    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'Project key already exists'
      });
    }

    const project = new Project({
      name,
      description,
      key,
      owner: userId,
      members: [userId],
      endDate
    });

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, endDate, status } = req.body;
    const userId = req.user!._id;

    const project = await Project.findOne({
      _id: id,
      owner: userId // Only owner can update
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you are not the owner'
      });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (endDate) project.endDate = endDate;
    if (status) project.status = status;

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members', 'name email avatar');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const project = await Project.findOne({
      _id: id,
      owner: userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you are not the owner'
      });
    }

    // Archive instead of delete to preserve data
    project.status = 'archived';
    await project.save();

    res.json({
      success: true,
      message: 'Project archived successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to archive project',
      error: error.message
    });
  }
};

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user!._id;

    const project = await Project.findOne({
      _id: id,
      owner: userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you are not the owner'
      });
    }

    // Find user by email
    const user = await Project.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already a member
    if (project.members.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }

    project.members.push(user._id);
    await project.save();
    await project.populate('members', 'name email avatar');

    res.json({
      success: true,
      message: 'Member added successfully',
      data: {
        project
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to add member',
      error: error.message
    });
  }
};