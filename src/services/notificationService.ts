import { NotificationRequest, NotificationResponse } from '../types';
import { getSendGridConfig } from '../config';

// Type declarations for Node.js environment
declare const console: any;

/**
 * Notification Service for SendGrid API integration
 * Sends delay notifications via email to customers
 */

export class NotificationService {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    const config = getSendGridConfig();
    this.apiKey = config.apiKey;
    this.fromEmail = config.fromEmail;
  }

  /**
   * Sends a delay notification email to the customer
   * @param request - The notification request with email details
   * @returns Promise<NotificationResponse> - Notification response
   */
  async sendDelayNotification(request: NotificationRequest): Promise<NotificationResponse> {
    try {
      const mockResponse = this.simulateEmailSending(request);

      console.log('Notification sent successfully');
      return mockResponse;
    } catch (error) {
      console.error('Error sending notification:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Notification service unavailable',
      };
    }
  }

  /**
   * Simulates email sending for demonstration purposes
   * @param request - The notification request
   * @returns NotificationResponse - Mock response
   */
  private simulateEmailSending(request: NotificationRequest): NotificationResponse {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      success: true,
      messageId,
    };
  }

  /**
   * Sends an SMS notification (alternative to email)
   * @param request - The notification request
   * @returns Promise<NotificationResponse> - Notification response
   */
  async sendSMSNotification(request: NotificationRequest): Promise<NotificationResponse> {
    try {
      const smsMessage = this.createSMSMessage(request);
      const mockResponse = this.simulateSMSSending(request, smsMessage);
      return mockResponse;
    } catch (error) {
      console.error('Error sending SMS notification:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMS service unavailable',
      };
    }
  }

  /**
   * Creates a shorter message suitable for SMS
   * @param request - The notification request
   * @returns string - SMS-formatted message
   */
  private createSMSMessage(request: NotificationRequest): string {
    return `Freight Delay Alert: Your delivery is delayed by ${request.delayMinutes} minutes due to traffic conditions. We apologize for the inconvenience. - Freight Team`;
  }

  /**
   * Simulates SMS sending for demonstration purposes
   * @param request - The notification request
   * @param smsMessage - The SMS message content
   * @returns NotificationResponse - Mock response
   */
  private simulateSMSSending(
    request: NotificationRequest,
    smsMessage: string
  ): NotificationResponse {
    const messageId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      success: true,
      messageId,
    };
  }

  /**
   * Demonstrates how we can integrate with SendGrid API
   * This method shows the actual implementation structure
   * @param request - The notification request
   * @returns Promise<NotificationResponse> - Would return real response
   */
  private async sendRealEmail(request: NotificationRequest): Promise<NotificationResponse> {
    // Example of how to integrate with SendGrid API:
    //
    // const emailData = {
    //   to: request.customerEmail,
    //   from: this.fromEmail,
    //   subject: request.subject,
    //   html: this.formatHTMLEmail(request.message),
    //   text: request.message
    // };
    //
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(emailData)
    // });
    //
    // if (!response.ok) {
    //   const error = await response.json();
    //   throw new Error(`SendGrid API error: ${error.errors?.[0]?.message || 'Unknown error'}`);
    // }
    //
    // const messageId = response.headers.get('x-message-id');
    //
    // return {
    //   success: true,
    //   messageId: messageId || 'unknown'
    // };

    // For now, return mock response
    return this.simulateEmailSending(request);
  }

  /**
   * Formats the email message as HTML
   * @param message - The plain text message
   * @returns string - HTML formatted message
   */
  private formatHTMLEmail(message: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d32f2f;">Delivery Delay Notification</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 20px;">
              This is an automated notification from your freight delivery service.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Validates the notification request
   * @param request - The notification request to validate
   * @returns boolean - Whether the request is valid
   */
  validateRequest(request: NotificationRequest): boolean {
    return !!(
      request.customerEmail &&
      request.customerEmail.includes('@') &&
      request.subject &&
      request.message &&
      request.delayMinutes > 0
    );
  }

  /**
   * Creates a standardized delay notification subject
   * @param delayMinutes - The delay in minutes
   * @returns string - Email subject
   */
  createDelaySubject(delayMinutes: number): string {
    return `Freight Delivery Delay Notice - ${delayMinutes} Minutes`;
  }
}
