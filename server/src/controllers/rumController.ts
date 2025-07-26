import { Request, Response } from 'express';
import RumEvent, { RumEventType } from '../models/RumEvent';
import { AuthRequest } from '../middleware/auth';

export const collectEvent = async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      userId,
      eventType,
      eventData,
      url,
      referrer,
      viewport,
      performance,
      error
    } = req.body;

    const userAgent = req.headers['user-agent'] || 'unknown';

    const rumEvent = new RumEvent({
      sessionId,
      userId,
      eventType,
      eventData,
      userAgent,
      url,
      referrer,
      viewport,
      performance,
      error
    });

    await rumEvent.save();

    res.status(201).json({
      success: true,
      message: 'Event collected successfully'
    });
  } catch (error: any) {
    // Don't let RUM collection errors break the app
    console.error('RUM collection error:', error);
    res.status(200).json({
      success: false,
      message: 'Event collection failed but ignored'
    });
  }
};

export const batchCollectEvents = async (req: Request, res: Response) => {
  try {
    const { events } = req.body;
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Events array is required'
      });
    }

    // Process events in batches to avoid memory issues
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < events.length; i += batchSize) {
      batches.push(events.slice(i, i + batchSize));
    }

    let totalSaved = 0;
    for (const batch of batches) {
      const rumEvents = batch.map(event => ({
        ...event,
        userAgent
      }));

      try {
        await RumEvent.insertMany(rumEvents, { ordered: false });
        totalSaved += rumEvents.length;
      } catch (error) {
        // Some events might fail validation, continue with others
        console.error('Batch insert error:', error);
      }
    }

    res.status(201).json({
      success: true,
      message: `${totalSaved} events collected successfully`
    });
  } catch (error: any) {
    console.error('Batch RUM collection error:', error);
    res.status(200).json({
      success: false,
      message: 'Batch event collection failed but ignored'
    });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      startDate, 
      endDate, 
      eventType, 
      userId: targetUserId 
    } = req.query;

    // Build filter
    const filter: any = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    if (eventType) filter.eventType = eventType;
    if (targetUserId) filter.userId = targetUserId;

    // Get basic analytics
    const totalEvents = await RumEvent.countDocuments(filter);
    
    // Event type distribution
    const eventTypeStats = await RumEvent.aggregate([
      { $match: filter },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Daily event counts (last 7 days if no date range specified)
    const defaultStartDate = startDate ? new Date(startDate as string) : 
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate ? new Date(endDate as string) : new Date();

    const dailyStats = await RumEvent.aggregate([
      {
        $match: {
          ...filter,
          createdAt: {
            $gte: defaultStartDate,
            $lte: defaultEndDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Performance metrics
    const performanceStats = await RumEvent.aggregate([
      {
        $match: {
          ...filter,
          'performance.loadTime': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgLoadTime: { $avg: '$performance.loadTime' },
          maxLoadTime: { $max: '$performance.loadTime' },
          minLoadTime: { $min: '$performance.loadTime' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Error statistics
    const errorStats = await RumEvent.aggregate([
      {
        $match: {
          ...filter,
          eventType: RumEventType.ERROR
        }
      },
      {
        $group: {
          _id: '$error.message',
          count: { $sum: 1 },
          urls: { $addToSet: '$url' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top pages
    const topPages = await RumEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$url',
          count: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          url: '$_id',
          count: 1,
          uniqueSessions: { $size: '$uniqueSessions' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalEvents,
          dateRange: {
            start: defaultStartDate,
            end: defaultEndDate
          }
        },
        eventTypeStats,
        dailyStats,
        performanceStats: performanceStats[0] || null,
        errorStats,
        topPages
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
};

export const getUserSessions = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: targetUserId, sessionId } = req.query;
    const { limit = 50, skip = 0 } = req.query;

    const filter: any = {};
    if (targetUserId) filter.userId = targetUserId;
    if (sessionId) filter.sessionId = sessionId;

    const sessions = await RumEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$sessionId',
          userId: { $first: '$userId' },
          startTime: { $min: '$createdAt' },
          endTime: { $max: '$createdAt' },
          eventCount: { $sum: 1 },
          pages: { $addToSet: '$url' },
          events: { $push: {
            eventType: '$eventType',
            timestamp: '$createdAt',
            url: '$url'
          }}
        }
      },
      {
        $project: {
          sessionId: '$_id',
          userId: 1,
          startTime: 1,
          endTime: 1,
          duration: { $subtract: ['$endTime', '$startTime'] },
          eventCount: 1,
          pageCount: { $size: '$pages' },
          events: { $slice: ['$events', parseInt(limit as string)] }
        }
      },
      { $sort: { startTime: -1 } },
      { $skip: parseInt(skip as string) },
      { $limit: parseInt(limit as string) }
    ]);

    res.json({
      success: true,
      data: {
        sessions
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user sessions',
      error: error.message
    });
  }
};

export const getPerformanceMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const { url, startDate, endDate } = req.query;

    const filter: any = {
      'performance.loadTime': { $exists: true, $ne: null }
    };

    if (url) filter.url = url;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const performanceMetrics = await RumEvent.aggregate([
  { $match: filter },
  {
    $group: {
      _id: '$url',
      avgLoadTime: { $avg: '$performance.loadTime' },
      p95LoadTime: { 
        $percentile: { 
          input: '$performance.loadTime', 
          p: [0.95], // Should be an array
          method: 'approximate' // Required method field
        } 
      },
      maxLoadTime: { $max: '$performance.loadTime' },
      minLoadTime: { $min: '$performance.loadTime' },
      sampleCount: { $sum: 1 }
    }
  },
  {
    $addFields: {
      // Calculate median using a different approach since $median might not be available
      medianLoadTime: {
        $percentile: {
          input: '$performance.loadTime',
          p: [0.5], // 50th percentile = median
          method: 'approximate'
        }
      }
    }
  },
  { $sort: { avgLoadTime: -1 } }
] as any); // Type assertion to bypass TypeScript issues

    res.json({
      success: true,
      data: {
        performanceMetrics
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      error: error.message
    });
  }
};