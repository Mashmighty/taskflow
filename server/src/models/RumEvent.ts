import mongoose, { Document, Schema } from 'mongoose';

export interface IRumEvent extends Document {
  sessionId: string;
  userId?: string;
  eventType: string;
  eventData: Record<string, any>;
  userAgent: string;
  url: string;
  timestamp: Date;
  performance?: {
    loadTime?: number;
    renderTime?: number;
    apiResponseTime?: number;
  };
}

const RumEventSchema = new Schema<IRumEvent>({
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  eventType: { type: String, required: true, index: true },
  eventData: { type: Schema.Types.Mixed, default: {} },
  userAgent: { type: String, required: true },
  url: { type: String, required: true },
  performance: {
    loadTime: Number,
    renderTime: Number,
    apiResponseTime: Number
  }
}, {
  timestamps: true
});

// Index for efficient querying
RumEventSchema.index({ sessionId: 1, timestamp: -1 });
RumEventSchema.index({ eventType: 1, timestamp: -1 });

export default mongoose.model<IRumEvent>('RumEvent', RumEventSchema);