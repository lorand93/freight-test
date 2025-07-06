import { getAppConfig } from '../config';
const appConfig = getAppConfig();

export const scenarios = [
  {
    name: 'Scenario 1: Short Route - No Delay Expected',
    input: {
      route: {
        origin: 'New York, NY',
        destination: 'Philadelphia, PA',
      },
      customerEmail: appConfig.customerEmail,
      delayThresholdMinutes: appConfig.delayThresholdMinutes,
    },
  },
  {
    name: 'Scenario 2: Long Route - Potential Delay',
    input: {
      route: {
        origin: 'Los Angeles, CA',
        destination: 'New York, NY',
        waypoints: ['Las Vegas, NV', 'Denver, CO', 'Chicago, IL'],
      },
      customerEmail: appConfig.customerEmail,
      delayThresholdMinutes: appConfig.delayThresholdMinutes,
    },
  },
  {
    name: 'Scenario 3: Urban Route - High Traffic Expected',
    input: {
      route: {
        origin: 'San Francisco, CA',
        destination: 'Los Angeles, CA',
      },
      customerEmail: appConfig.customerEmail,
      delayThresholdMinutes: 10,
    },
  },
];
