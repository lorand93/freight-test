import { TrafficService } from '../services/trafficService';
import { AIService } from '../services/aiService';
import { NotificationService } from '../services/notificationService';

/**
 * Test Suite for Freight Delay Notification Services
 *
 * These tests demonstrate the basic functionality of the service layer.
 * In a production environment, you would add more comprehensive tests
 * including integration tests, error handling tests, and performance tests.
 */

describe('TrafficService', () => {
  let trafficService: TrafficService;

  beforeEach(() => {
    trafficService = new TrafficService();
  });

  test('should validate valid route', () => {
    const validRoute = {
      origin: 'New York, NY',
      destination: 'Philadelphia, PA',
    };

    expect(trafficService.validateRoute(validRoute)).toBe(true);
  });

  test('should reject invalid route', () => {
    const invalidRoute = {
      origin: '',
      destination: 'Philadelphia, PA',
    };

    expect(trafficService.validateRoute(invalidRoute)).toBe(false);
  });

  test('should fetch traffic data', async () => {
    const route = {
      origin: 'New York, NY',
      destination: 'Philadelphia, PA',
    };

    const trafficData = await trafficService.getTrafficData(route);

    expect(trafficData).toBeDefined();
    expect(trafficData.route).toEqual(route);
    expect(trafficData.estimatedDelayMinutes).toBeGreaterThanOrEqual(0);
    expect(trafficData.normalDurationMinutes).toBeGreaterThan(0);
    expect(trafficData.currentDurationMinutes).toBeGreaterThan(0);
    expect(['light', 'moderate', 'heavy', 'severe']).toContain(trafficData.trafficCondition);
  });
});

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  test('should validate valid AI request', () => {
    const validRequest = {
      delayMinutes: 45,
      route: {
        origin: 'New York, NY',
        destination: 'Philadelphia, PA',
      },
      trafficCondition: 'heavy' as const,
    };

    expect(aiService.validateRequest(validRequest)).toBe(true);
  });

  test('should reject invalid AI request', () => {
    const invalidRequest = {
      delayMinutes: 0,
      route: {
        origin: '',
        destination: 'Philadelphia, PA',
      },
      trafficCondition: 'heavy' as const,
    };

    expect(aiService.validateRequest(invalidRequest)).toBe(false);
  });

  test('should generate AI message', async () => {
    const request = {
      delayMinutes: 45,
      route: {
        origin: 'New York, NY',
        destination: 'Philadelphia, PA',
      },
      trafficCondition: 'heavy' as const,
    };

    const response = await aiService.generateDelayMessage(request);

    expect(response).toBeDefined();
    expect(response.message).toBeDefined();
    expect(response.message.length).toBeGreaterThan(0);
    expect(response.success).toBe(true);
  });
});

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
  });

  test('should validate valid notification request', () => {
    const validRequest = {
      customerEmail: 'customer@example.com',
      subject: 'Delivery Delay Notice',
      message: 'Your delivery is delayed by 45 minutes.',
      delayMinutes: 45,
    };

    expect(notificationService.validateRequest(validRequest)).toBe(true);
  });

  test('should reject invalid notification request', () => {
    const invalidRequest = {
      customerEmail: 'invalid-email',
      subject: 'Delivery Delay Notice',
      message: 'Your delivery is delayed by 45 minutes.',
      delayMinutes: 45,
    };

    expect(notificationService.validateRequest(invalidRequest)).toBe(false);
  });

  test('should create delay subject', () => {
    const delayMinutes = 45;
    const subject = notificationService.createDelaySubject(delayMinutes);

    expect(subject).toContain('45 Minutes');
    expect(subject).toContain('Delay');
  });

  test('should send delay notification', async () => {
    const request = {
      customerEmail: 'customer@example.com',
      subject: 'Delivery Delay Notice',
      message: 'Your delivery is delayed by 45 minutes.',
      delayMinutes: 45,
    };

    const response = await notificationService.sendDelayNotification(request);

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.messageId).toBeDefined();
  });

  test('should send SMS notification', async () => {
    const request = {
      customerEmail: 'customer@example.com',
      subject: 'Delivery Delay Notice',
      message: 'Your delivery is delayed by 45 minutes.',
      delayMinutes: 45,
    };

    const response = await notificationService.sendSMSNotification(request);

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.messageId).toBeDefined();
  });
});

describe('Integration Tests', () => {
  test('should handle end-to-end scenario', async () => {
    // This test demonstrates how the services work together
    const trafficService = new TrafficService();
    const aiService = new AIService();
    const notificationService = new NotificationService();

    // Step 1: Get traffic data
    const route = {
      origin: 'New York, NY',
      destination: 'Philadelphia, PA',
    };
    const trafficData = await trafficService.getTrafficData(route);
    expect(trafficData).toBeDefined();

    // Step 2: Generate AI message (if delay is significant)
    if (trafficData.estimatedDelayMinutes > 0) {
      const aiRequest = {
        delayMinutes: trafficData.estimatedDelayMinutes,
        route: trafficData.route,
        trafficCondition: trafficData.trafficCondition,
      };
      const aiResponse = await aiService.generateDelayMessage(aiRequest);
      expect(aiResponse.success).toBe(true);

      // Step 3: Send notification
      const notificationRequest = {
        customerEmail: 'customer@example.com',
        subject: notificationService.createDelaySubject(trafficData.estimatedDelayMinutes),
        message: aiResponse.message,
        delayMinutes: trafficData.estimatedDelayMinutes,
      };
      const notificationResponse =
        await notificationService.sendDelayNotification(notificationRequest);
      expect(notificationResponse.success).toBe(true);
    }
  });
});

// Mock console to avoid cluttering test output
const originalConsole = console;
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});
