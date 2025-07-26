# 🚀 TaskFlow Backend Implementation
## Complete MERN Stack with RUM Monitoring

### 🎯 Current Status: ✅ MongoDB Atlas Connected!

Now let's build the complete backend with all the models, routes, and RUM monitoring capabilities.

---

## 📁 Step 1: Complete Backend Structure

### Create all necessary directories:
```bash
cd server
mkdir -p src/{controllers,models,routes,middleware,services,types,utils}
```

### Directory structure:
```
server/
├── src/
│   ├── controllers/     # Route handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── middleware/     # Auth, validation, etc.
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── utils/          # Helper functions
│   └── index.ts        # Main server file
├── .env                # Environment variables
└── package.json
```

---

## 🗄️ Step 2: Complete Database Models

### Update User Model
**`src/models/User.ts`:**
```typescript
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatar: { 
    type: String, 
    default: function() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=random`;
    }
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ isActive: 1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model<IUser>('User', UserSchema);
```

### Complete Project Model
**`src/models/Project.ts`:**
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  key: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  status: 'active' | 'archived' | 'completed';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { 
    type: String, 
    required: [true, 'Project name is required'], 
    trim: true,
    minlength: [3, 'Project name must be at least 3 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    trim: true, 
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '' 
  },
  key: { 
    type: String, 
    required: [true, 'Project key is required'], 
    unique: true, 
    uppercase: true,
    match: [/^[A-Z]{2,10}$/, 'Project key must be 2-10 uppercase letters']
  },
  owner: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Project owner is required'] 
  },
  members: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date
}, {
  timestamps: true
});

// Indexes
ProjectSchema.index({ key: 1 });
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ members: 1 });

// Virtual for task count
ProjectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true
});

export default mongoose.model<IProject>('Project', ProjectSchema);
```

### Enhanced Task Model
**`src/models/Task.ts`:**
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TaskType {
  TASK = 'TASK',
  BUG = 'BUG',
  STORY = 'STORY',
  EPIC = 'EPIC'
}

export interface ITask extends Document {
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  project: mongoose.Types.ObjectId;
  assignee?: mongoose.Types.ObjectId;
  reporter: mongoose.Types.ObjectId;
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  tags: string[];
  dueDate?: Date;
  completedAt?: Date;
  position: number; // For drag & drop ordering
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: { 
    type: String, 
    required: [true, 'Task title is required'], 
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: { 
    type: String, 
    trim: true, 
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: '' 
  },
  type: {
    type: String,
    enum: Object.values(TaskType),
    default: TaskType.TASK
  },
  status: { 
    type: String, 
    enum: Object.values(TaskStatus), 
    default: TaskStatus.TODO 
  },
  priority: { 
    type: String, 
    enum: Object.values(TaskPriority), 
    default: TaskPriority.MEDIUM 
  },
  project: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', 
    required: [true, 'Project is required'] 
  },
  assignee: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reporter: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Reporter is required'] 
  },
  estimatedHours: { 
    type: Number, 
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000']
  },
  actualHours: { 
    type: Number, 
    min: [0, 'Actual hours cannot be negative'],
    max: [1000, 'Actual hours cannot exceed 1000']
  },
  storyPoints: {
    type: Number,
    min: [1, 'Story points must be at least 1'],
    max: [100, 'Story points cannot exceed 100']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  dueDate: Date,
  completedAt: Date,
  position: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ assignee: 1 });
TaskSchema.index({ reporter: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ status: 1, position: 1 });

// Middleware to set completedAt when status changes to DONE
TaskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === TaskStatus.DONE && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== TaskStatus.DONE) {
      this.completedAt = undefined;
    }
  }
  next();
});

export default mongoose.model<ITask>('Task', TaskSchema);
```

### Enhanced RUM Event Model
**`src/models/RumEvent.ts`:**
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export enum RumEventType {
  PAGE_LOAD = 'PAGE_LOAD',
  PAGE_VIEW = 'PAGE_VIEW',
  CLICK = 'CLICK',
  FORM_SUBMIT = 'FORM_SUBMIT',
  ERROR = 'ERROR',
  API_CALL = 'API_CALL',
  CUSTOM = 'CUSTOM',
  DRAG_DROP = 'DRAG_DROP',
  SEARCH = 'SEARCH'
}

export interface IRumEvent extends Document {
  sessionId: string;
  userId?: string;
  eventType: RumEventType;
  eventData: Record<string, any>;
  userAgent: string;
  url: string;
  referrer?: string;
  viewport: {
    width: number;
    height: number;
  };
  performance?: {
    loadTime?: number;
    renderTime?: number;
    apiResponseTime?: number;
    memoryUsage?: number;
    connectionType?: string;
  };
  error?: {
    message: string;
    stack?: string;
    line?: number;
    column?: number;
  };
  timestamp: Date;
}

const RumEventSchema = new Schema<IRumEvent>({
  sessionId: { 
    type: String, 
    required: true, 
    index: true,
    maxlength: [100, 'Session ID too long']
  },
  userId: { 
    type: String, 
    index: true,
    maxlength: [100, 'User ID too long']
  },
  eventType: { 
    type: String, 
    required: true, 
    enum: Object.values(RumEventType),
    index: true 
  },
  eventData: { 
    type: Schema.Types.Mixed, 
    default: {},
    validate: {
      validator: function(v: any) {
        return JSON.stringify(v).length <= 10000; // Limit size
      },
      message: 'Event data too large'
    }
  },
  userAgent: { 
    type: String, 
    required: true,
    maxlength: [500, 'User agent too long']
  },
  url: { 
    type: String, 
    required: true,
    maxlength: [2000, 'URL too long']
  },
  referrer: {
    type: String,
    maxlength: [2000, 'Referrer too long']
  },
  viewport: {
    width: { type: Number, min: 0, max: 10000 },
    height: { type: Number, min: 0, max: 10000 }
  },
  performance: {
    loadTime: { type: Number, min: 0 },
    renderTime: { type: Number, min: 0 },
    apiResponseTime: { type: Number, min: 0 },
    memoryUsage: { type: Number, min: 0 },
    connectionType: {
      type: String,
      enum: ['slow-2g', '2g', '3g', '4g', '5g', 'wifi', 'ethernet', 'unknown']
    }
  },
  error: {
    message: { type: String, maxlength: [1000, 'Error message too long'] },
    stack: { type: String, maxlength: [5000, 'Error stack too long'] },
    line: Number,
    column: Number
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
RumEventSchema.index({ sessionId: 1, timestamp: -1 });
RumEventSchema.index({ eventType: 1, timestamp: -1 });
RumEventSchema.index({ userId: 1, timestamp: -1 });
RumEventSchema.index({ url: 1, eventType: 1 });

// TTL index to automatically delete old events (optional)
RumEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days

export default mongoose.model<IRumEvent>('RumEvent', RumEventSchema);
```

---

## 🔐 Step 3: Authentication & Middleware

### JWT Utilities
**`src/utils/jwt.ts`:**
```typescript
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
    issuer: 'taskflow-api',
    audience: 'taskflow-client'
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!, {
    issuer: 'taskflow-api',
    audience: 'taskflow-client'
  }) as JwtPayload;
};
```

### Enhanced Auth Middleware
**`src/middleware/auth.ts`:**
```typescript
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required' 
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token or user inactive' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};
```

### Validation Middleware
**`src/middleware/validation.ts`:**
```typescript
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Project validation rules
export const validateProject = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Project name must be between 3 and 100 characters'),
  body('key')
    .trim()
    .matches(/^[A-Z]{2,10}$/)
    .withMessage('Project key must be 2-10 uppercase letters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors
];

// Task validation rules
export const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Task title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Invalid priority'),
  body('type')
    .optional()
    .isIn(['TASK', 'BUG', 'STORY', 'EPIC'])
    .withMessage('Invalid task type'),
  handleValidationErrors
];
```

---

## 🛣️ Step 4: API Controllers

### Auth Controller
**`src/controllers/authController.ts`:**
```typescript
import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatar } = req.body;
    const user = req.user!;

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};
```

### Project Controller
**`src/controllers/projectController.ts`:**
```typescript
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
```

This is the first part of the complete backend implementation. The models are now ready and the auth/project controllers are implemented.

**Next steps:**
1. Complete the Task controller
2. Implement RUM controller 
3. Set up all the API routes
4. Test the backend APIs

Would you like me to continue with the Task and RUM controllers, or would you prefer