import express from 'express';

const router = express.Router();

// Mock RUM (Real User Monitoring) data
let rumData: any[] = [];

// POST /api/rum/events - Collect RUM events
router.post('/events', (req, res) => {
  try {
    const { eventType, url, timestamp, userAgent, sessionId, performance } = req.body;

    if (!eventType || !url) {
      return res.status(400).json({ error: 'eventType and url are required' });
    }

    const rumEvent = {
      id: Date.now() + Math.random(),
      eventType,
      url,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || req.headers['user-agent'],
      sessionId: sessionId || 'anonymous',
      performance: performance || {},
      ip: req.ip,
      createdAt: new Date()
    };

    rumData.push(rumEvent);

    // Keep only last 1000 events to prevent memory issues
    if (rumData.length > 1000) {
      rumData = rumData.slice(-1000);
    }

    res.status(201).json({ success: true, eventId: rumEvent.id });
  } catch (error) {
    console.error('Error collecting RUM event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/rum/analytics - Get analytics data
router.get('/analytics', (req, res) => {
  try {
    const { startDate, endDate, eventType } = req.query;
    let filteredData = [...rumData];

    // Filter by date range
    if (startDate) {
      filteredData = filteredData.filter(event => 
        new Date(event.timestamp) >= new Date(startDate as string)
      );
    }

    if (endDate) {
      filteredData = filteredData.filter(event => 
        new Date(event.timestamp) <= new Date(endDate as string)
      );
    }

    // Filter by event type
    if (eventType) {
      filteredData = filteredData.filter(event => event.eventType === eventType);
    }

    // Calculate basic analytics
    const analytics = {
      totalEvents: filteredData.length,
      uniqueSessions: new Set(filteredData.map(e => e.sessionId)).size,
      eventTypes: filteredData.reduce((acc: any, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {}),
      topPages: filteredData.reduce((acc: any, event) => {
        acc[event.url] = (acc[event.url] || 0) + 1;
        return acc;
      }, {}),
      averagePerformance: filteredData
        .filter(e => e.performance && e.performance.loadTime)
        .reduce((sum, event, _, arr) => {
          return arr.length > 0 ? sum + event.performance.loadTime / arr.length : 0;
        }, 0)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching RUM analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/rum/health - Health check endpoint
router.get('/health', (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      eventsCount: rumData.length,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };

    res.json(health);
  } catch (error) {
    console.error('Error checking health:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/rum/clear - Clear all RUM data (for testing)
router.delete('/clear', (req, res) => {
  try {
    const eventCount = rumData.length;
    rumData = [];
    res.json({ 
      success: true, 
      message: `Cleared ${eventCount} RUM events` 
    });
  } catch (error) {
    console.error('Error clearing RUM data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;