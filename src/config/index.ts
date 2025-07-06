import { APIConfig } from '../types';

/**
 * Configuration module
 * Handles environment variables and API configuration
 */
const getConfig = (): APIConfig => {
  const config: APIConfig = {
    openaiApiKey: process.env.GOOGLE_MAPS_API_KEY || 'demo-key',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'demo-key',
    sendgridApiKey: process.env.SENDGRID_API_KEY || 'demo-key',
    temporalAddress: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    temporalNamespace: process.env.TEMPORAL_NAMESPACE || 'default',
    delayThresholdMinutes: parseInt(process.env.DELAY_THRESHOLD_MINUTES || '30'),
    fromEmail: process.env.FROM_EMAIL || 'noreply@freightnotifications.com',
    customerEmail: process.env.CUSTOMER_EMAIL || 'customer@example.com',
  };

  return config;
};

export const config = getConfig();

export const getOpenAIConfig = () => ({
  apiKey: config.openaiApiKey,
  model: 'gpt-4o-mini',
});

export const getGoogleMapsConfig = () => ({
  apiKey: config.googleMapsApiKey,
});

export const getSendGridConfig = () => ({
  apiKey: config.sendgridApiKey,
  fromEmail: config.fromEmail,
});

export const getTemporalConfig = () => ({
  address: config.temporalAddress,
  namespace: config.temporalNamespace,
});

export const getAppConfig = () => ({
  delayThresholdMinutes: config.delayThresholdMinutes,
  customerEmail: config.customerEmail,
});
