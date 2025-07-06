import { proxyActivities } from '@temporalio/workflow';
import {
  DelayNotificationInput,
  WorkflowResult,
  TrafficData,
  AIMessageRequest,
  AIMessageResponse,
  NotificationRequest,
  NotificationResponse,
} from '../types';
import type { activities } from '../activities';

/**
 * Main Freight Delay Notification Workflow
 *
 * This workflow implements the complete freight delay notification process:
 * 1. Fetch traffic data for the delivery route
 * 2. Check if delay exceeds threshold
 * 3. Generate AI message if delay is significant
 * 4. Send notification to customer
 *
 * The workflow follows Temporal best practices for error handling and retry logic
 */

// Configure activity options with retry policies
const {
  fetchTrafficData,
  generateAIMessage,
  sendDelayNotification,
  sendSMSNotification,
  shouldSendNotification,
  createNotificationRequest,
  logWorkflowStep,
  createAIMessageRequest,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    initialInterval: '1 second',
    maximumInterval: '10 seconds',
    maximumAttempts: 3,
    backoffCoefficient: 2,
  },
}) as any;

/**
 * Freight Delay Notification Workflow
 * @param input - The workflow input containing route and notification parameters
 * @returns Promise<WorkflowResult> - The workflow result with notification status
 */
export async function freightDelayNotificationWorkflow(
  input: DelayNotificationInput
): Promise<WorkflowResult> {
  await logWorkflowStep('Workflow Started', {
    route: input.route,
    customerEmail: input.customerEmail,
    threshold: input.delayThresholdMinutes,
  });

  try {
    await logWorkflowStep('Step 1: Fetching Traffic Data');
    const trafficData: TrafficData = await fetchTrafficData(input.route);

    await logWorkflowStep('Step 1 Complete: Traffic Data Retrieved', {
      delay: trafficData.estimatedDelayMinutes,
      condition: trafficData.trafficCondition,
    });

    await logWorkflowStep('Step 2: Checking Delay Threshold');
    const shouldNotify = await shouldSendNotification(
      trafficData.estimatedDelayMinutes,
      input.delayThresholdMinutes
    );

    if (!shouldNotify) {
      await logWorkflowStep('Step 2 Complete: No Notification Required', {
        delay: trafficData.estimatedDelayMinutes,
        threshold: input.delayThresholdMinutes,
      });

      return {
        delayDetected: false,
        delayMinutes: trafficData.estimatedDelayMinutes,
        notificationSent: false,
        message: `No notification required. Delay of ${trafficData.estimatedDelayMinutes} minutes is below threshold of ${input.delayThresholdMinutes} minutes.`,
      };
    }

    await logWorkflowStep('Step 3: Generating AI Message');
    const aiRequest: AIMessageRequest = await createAIMessageRequest(trafficData);
    const aiResponse: AIMessageResponse = await generateAIMessage(aiRequest);

    if (!aiResponse.success) {
      await logWorkflowStep('Step 3 Warning: AI Message Generation Failed', {
        error: aiResponse.error,
        usingFallback: true,
      });
    } else {
      await logWorkflowStep('Step 3 Complete: AI Message Generated');
    }

    await logWorkflowStep('Step 4: Sending Notification');
    const notificationRequest: NotificationRequest = await createNotificationRequest(
      input.customerEmail,
      aiResponse.message,
      trafficData.estimatedDelayMinutes
    );

    const notificationResponse: NotificationResponse = await sendDelayNotification(notificationRequest);

    if (notificationResponse.success) {
      await logWorkflowStep('Step 4 Complete: Notification Sent Successfully', {
        messageId: notificationResponse.messageId,
        customer: input.customerEmail,
      });

      return {
        delayDetected: true,
        delayMinutes: trafficData.estimatedDelayMinutes,
        notificationSent: true,
        message: `Delay notification sent successfully. Customer ${input.customerEmail} has been notified of ${trafficData.estimatedDelayMinutes} minute delay.`,
      };
    } else {
      await logWorkflowStep('Step 4 Warning: Notification Failed', {
        error: notificationResponse.error,
        tryingSMS: true,
      });


      // POSSIBLE IMPROVEMENT: Require a temporal signal before sending the SMS notification
      const smsResponse: NotificationResponse = await sendSMSNotification(notificationRequest);
      if (smsResponse.success) {
        await logWorkflowStep('Step 4 Complete: SMS Notification Sent', {
          messageId: smsResponse.messageId,
        });

        return {
          delayDetected: true,
          delayMinutes: trafficData.estimatedDelayMinutes,
          notificationSent: true,
          message: `Delay notification sent via SMS after email failed. Customer notified of ${trafficData.estimatedDelayMinutes} minute delay.`,
        };
      } else {
        await logWorkflowStep('Step 4 Failed: Both Email and SMS Failed', {
          emailError: notificationResponse.error,
          smsError: smsResponse.error,
        });

        return {
          delayDetected: true,
          delayMinutes: trafficData.estimatedDelayMinutes,
          notificationSent: false,
          error: `Failed to send notification: Email failed (${notificationResponse.error}), SMS failed (${smsResponse.error})`,
        };
      }
    }
  } catch (error) {
    await logWorkflowStep('Workflow Error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      delayDetected: false,
      delayMinutes: 0,
      notificationSent: false,
      error: error instanceof Error ? error.message : 'Unknown workflow error',
    };
  }
}
