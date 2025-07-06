import { Worker } from '@temporalio/worker';
import { activities } from './activities';
import { getTemporalConfig } from './config';

/**
 * Temporal Worker for Freight Delay Notification System
 * This worker connects to the Temporal server and executes workflows and activities.
 * It handles the business logic for traffic monitoring and delay notifications.
 */

const TASK_QUEUE = 'freight-delay-notifications';

async function startWorker() {
  try {
    console.log('Starting Temporal Worker for Freight Delay Notification System');

    const config = getTemporalConfig();
    console.log(`Connecting to Temporal server at: ${config.address}`);
    console.log(`Using namespace: ${config.namespace}`);

    const worker = await Worker.create({
      workflowsPath: require.resolve('./workflows/freightDelayWorkflow'),
      activities,
      taskQueue: TASK_QUEUE,
      namespace: config.namespace,
      maxConcurrentActivityTaskExecutions: 10,
      maxConcurrentWorkflowTaskExecutions: 10,
    });

    await worker.run();
  } catch (error) {
    console.error('Failed to start Temporal Worker:', error);

    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }

    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('Received SIGINT signal. Shutting down gracefully');
  console.log('Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Shutting down gracefully');
  console.log('Goodbye!');
  process.exit(0);
});

if (require.main === module) {
  startWorker().catch(error => {
    console.error('Unhandled error in worker:', error);
    process.exit(1);
  });
}
