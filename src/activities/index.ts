import {
  AIMessageRequest,
  AIMessageResponse,
  DeliveryRoute,
  NotificationRequest,
  NotificationResponse,
  TrafficData,
} from '../types';
import { TrafficService } from '../services/trafficService';
import { AIService } from '../services/aiService';
import { NotificationService } from '../services/notificationService';

// Type declarations for Node.js environment
declare const console: any;

/**
 * Temporal Activities for the Freight Delay Notification System
 * These activities encapsulate the business logic for each step of the workflow
 */

// Service instances (in production, these could be dependency-injected)
const trafficService = new TrafficService();
const aiService = new AIService();
const notificationService = new NotificationService();

/**
 * Activity 1: Fetch traffic data for a delivery route
 * This activity calls the traffic service to get current traffic conditions
 * @param route - The delivery route to check
 * @returns Promise<TrafficData> - Traffic data with delay information
 */
export async function fetchTrafficData(route: DeliveryRoute): Promise<TrafficData> {
  console.log('Activity 1: Fetching traffic data');

  if (!trafficService.validateRoute(route)) {
    throw new Error('Invalid route: Origin and destination are required');
  }

  try {
    return await trafficService.getTrafficData(route);
  } catch (error) {
    console.error('Failed to fetch traffic data:', error);
    throw error;
  }
}

/**
 * Activity 2: Generate AI message for delay notification
 * This activity uses OpenAI to generate a friendly customer message
 * @param request - The AI message request with delay details
 * @returns Promise<AIMessageResponse> - Generated message response
 */
export async function generateAIMessage(request: AIMessageRequest): Promise<AIMessageResponse> {
  console.log('Activity 2: Generating AI message');

  if (!aiService.validateRequest(request)) {
    throw new Error('Invalid AI message request: Missing required fields');
  }

  try {
    const response = await aiService.generateDelayMessage(request);
    if (response.error) {
      console.log(`  Error: ${response.error}`);
    }

    return response;
  } catch (error) {
    console.error('Failed to generate AI message:', error);
    throw error;
  }
}

/**
 * Activity 3: Send delay notification to customer
 * @param request - The notification request with email details
 * @returns Promise<NotificationResponse> - Notification response
 */
export async function sendDelayNotification(
  request: NotificationRequest
): Promise<NotificationResponse> {
  console.log('Activity 3: Sending delay notification');

  if (!notificationService.validateRequest(request)) {
    throw new Error('Invalid notification request: Missing required fields');
  }

  try {
    const response = await notificationService.sendDelayNotification(request);
    if (response.messageId) {
      console.log(`Message ID: ${response.messageId}`);
    }

    if (response.error) {
      console.log(`Error: ${response.error}`);
    }

    return response;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}

/**
 * Activity 4: Send SMS notification as alternative to email
 * @param request - The notification request
 * @returns Promise<NotificationResponse> - Notification response
 */
export async function sendSMSNotification(
  request: NotificationRequest
): Promise<NotificationResponse> {
  console.log('Activity 4: Sending SMS notification');

  try {
    const response = await notificationService.sendSMSNotification(request);

    console.log('SMS notification sending completed:');
    console.log(`Success: ${response.success}`);
    console.log(`Customer: ${request.customerEmail}`);

    if (response.error) {
      console.log(`Error: ${response.error}`);
    }

    return response;
  } catch (error) {
    console.error('Failed to send SMS notification:', error);
    throw error;
  }
}

/**
 * Utility Activity: Validate delay threshold
 * @param delayMinutes - The delay in minutes
 * @param thresholdMinutes - The threshold in minutes
 * @returns boolean - Whether the delay exceeds the threshold
 */
export function shouldSendNotification(delayMinutes: number, thresholdMinutes: number): boolean {
  const shouldSend = delayMinutes > thresholdMinutes;
  console.log(`Should send notification: ${shouldSend}`);
  return shouldSend;
}

/**
 * Utility Activity: Create notification request
 * @param customerEmail - The customer's email address
 * @param aiMessage - The AI-generated message
 * @param delayMinutes - The delay in minutes
 * @returns NotificationRequest - Formatted notification request
 */
export function createNotificationRequest(
  customerEmail: string,
  aiMessage: string,
  delayMinutes: number
): NotificationRequest {
  const subject = notificationService.createDelaySubject(delayMinutes);

  return {
    customerEmail,
    subject,
    message: aiMessage,
    delayMinutes,
  };
}

/**
 * Utility Activity: Log workflow step for monitoring
 * @param stepName - The name of the workflow step
 * @param data - Optional data to log
 */
export function logWorkflowStep(stepName: string, data?: any): void {
  console.log(`Workflow Step: ${stepName}`);
  if (data) {
    console.log('  Data:', JSON.stringify(data, null, 2));
  }
  console.log(`  Timestamp: ${new Date().toISOString()}`);
}

/**
 * Utility Activity: Create AI message request
 * @param trafficData - The traffic data
 * @returns AIMessageRequest - Formatted AI message request
 */
export function createAIMessageRequest(trafficData: TrafficData): AIMessageRequest {
  console.log('Creating AI message request');

  const request: AIMessageRequest = {
    delayMinutes: trafficData.estimatedDelayMinutes,
    route: trafficData.route,
    trafficCondition: trafficData.trafficCondition,
  };

  console.log(`  Delay: ${request.delayMinutes} minutes`);
  console.log(`  Route: ${request.route.origin} to ${request.route.destination}`);
  console.log(`  Traffic condition: ${request.trafficCondition}`);

  return request;
}

/**
 * All activities export - used by the Temporal worker
 */
export const activities = {
  fetchTrafficData,
  generateAIMessage,
  sendDelayNotification,
  sendSMSNotification,
  shouldSendNotification,
  createNotificationRequest,
  logWorkflowStep,
  createAIMessageRequest,
};
