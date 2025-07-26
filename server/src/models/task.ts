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