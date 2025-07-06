import { Connection, Client } from '@temporalio/client';
import { DelayNotificationInput, WorkflowResult } from './types';
import { getTemporalConfig, getAppConfig } from './config';
import { scenarios } from './scenarios/testScenarios';

/**
 * Temporal Client for Freight Delay Notification System
 *
 * This client connects to the Temporal server and starts workflows.
 * It demonstrates the freight delay notification system with different scenarios.
 */
async function runClient() {
  try {
    const temporalConfig = getTemporalConfig();

    console.log(`Connecting to Temporal server at: ${temporalConfig.address}`);
    console.log(`Using namespace: ${temporalConfig.namespace}`);

    const connection = await Connection.connect({
      address: temporalConfig.address,
    });

    const client = new Client({
      connection,
      namespace: temporalConfig.namespace,
    });

    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      console.log(`${scenario.name}`);

      await runScenario(client, scenario.input, i + 1);

      if (i < scenarios.length - 1) {
        // adding a delay between scenarios
        await sleep(3000);
      }
      console.log('--------------------------------------------------');
      console.log('--------------------------------------------------');
    }

    console.log('All scenarios completed!');
  } catch (error) {
    console.error('Failed to run client:', error);

    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  }
}

/**
 * Run a single scenario
 * @param client - Temporal client
 * @param input - Workflow input
 * @param scenarioNumber - Scenario number for identification
 */
async function runScenario(client: Client, input: DelayNotificationInput, scenarioNumber: number) {
  try {
    logScenarioDetails(input);
    const workflowId = `freight-delay-${scenarioNumber}-${Date.now()}`;
    console.log('');
    console.log(`Starting workflow: ${workflowId}`);

    const handle = await client.workflow.start('freightDelayNotificationWorkflow', {
      args: [input],
      taskQueue: 'freight-delay-notifications',
      workflowId,
    });

    console.log(`Workflow started successfully: ${workflowId}`);

    const result: WorkflowResult = await handle.result();

    logScenarioResults(result, scenarioNumber);
  } catch (error) {
    console.error(`Scenario ${scenarioNumber} failed:`, error);

    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

/**
 * Sleep utility function
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logScenarioDetails(input: DelayNotificationInput) {
  console.log('Scenario Details:');
  console.log(`  Route: ${input.route.origin} to ${input.route.destination}`);
  if (input.route.waypoints) {
    console.log(`  Waypoints: ${input.route.waypoints.join(', ')}`);
  }
  console.log(`  Customer: ${input.customerEmail}`);
  console.log(`  Delay Threshold: ${input.delayThresholdMinutes} minutes`);
}

function logScenarioResults(result: WorkflowResult, scenarioNumber: number) {
  console.log('');
  console.log('Workflow Results:');
  console.log(`  Delay Detected: ${result.delayDetected}`);
  console.log(`  Delay Minutes: ${result.delayMinutes}`);
  console.log(`  Notification Sent: ${result.notificationSent}`);

  if (result.message) {
    console.log(`  Message: ${result.message}`);
  }

  if (result.error) {
    console.log(`  Error: ${result.error}`);
  }
  console.log('');
  console.log(`Scenario ${scenarioNumber} completed successfully!`);
  console.log('');
}

if (require.main === module) {
  runClient().catch(error => {
    console.error('Unhandled error in client:', error);
    process.exit(1);
  });
}
