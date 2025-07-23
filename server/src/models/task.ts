import mongoose, { Document, Schema } from 'mongoose';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS', 
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: mongoose.Types.ObjectId;
  assignee?: mongoose.Types.ObjectId;
  reporter: mongoose.Types.ObjectId;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
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
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  assignee: { type: Schema.Types.ObjectId, ref: 'User' },
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  estimatedHours: { type: Number, min: 0 },
  actualHours: { type: Number, min: 0 },
  dueDate: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<ITask>('Task', TaskSchema);