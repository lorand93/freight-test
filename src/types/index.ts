/**
 * Type definitions for the Freight Delay Notification System
 */

export interface DeliveryRoute {
  origin: string;
  destination: string;
  waypoints?: string[];
}

export interface TrafficData {
  estimatedDelayMinutes: number;
  normalDurationMinutes: number;
  currentDurationMinutes: number;
  trafficCondition: 'light' | 'moderate' | 'heavy' | 'severe';
  route: DeliveryRoute;
}

export interface DelayNotificationInput {
  route: DeliveryRoute;
  customerEmail: string;
  delayThresholdMinutes: number;
}

export interface AIMessageRequest {
  delayMinutes: number;
  route: DeliveryRoute;
  trafficCondition: string;
}

export interface AIMessageResponse {
  message: string;
  success: boolean;
  error?: string;
}

export interface NotificationRequest {
  customerEmail: string;
  subject: string;
  message: string;
  delayMinutes: number;
}

export interface NotificationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WorkflowResult {
  delayDetected: boolean;
  delayMinutes: number;
  notificationSent: boolean;
  message?: string;
  error?: string;
}

export interface APIConfig {
  openaiApiKey: string;
  googleMapsApiKey: string;
  sendgridApiKey: string;
  temporalAddress: string;
  temporalNamespace: string;
  delayThresholdMinutes: number;
  fromEmail: string;
  customerEmail: string;
}
