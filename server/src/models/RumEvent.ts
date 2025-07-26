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