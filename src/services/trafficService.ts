import { DeliveryRoute, TrafficData } from '../types';
import { getGoogleMapsConfig } from '../config';

// Type declarations for Node.js environment
declare const console: any;

/**
 * Traffic Service for Google Maps API integration
 * Fetches traffic data and calculates potential delays for delivery routes
 *
 * Note: This implementation uses mock data by default. In a production environment,
 * you would integrate with Google Maps Directions API using a proper HTTP client.
 */

export class TrafficService {
  private apiKey: string;

  constructor() {
    this.apiKey = getGoogleMapsConfig().apiKey;
  }

  /**
   * Fetches traffic data for a delivery route and calculates delay
   * @param route - The delivery route to check
   * @returns Promise<TrafficData> - Traffic data with delay information
   */
  async getTrafficData(route: DeliveryRoute): Promise<TrafficData> {
    try {
      return await this.getRealTrafficData(route);
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      console.log('Falling back to mock traffic data');
      return this.getMockTrafficData(route);
    }
  }

  /**
   * Generates mock traffic data for testing purposes
   * @param route - The delivery route
   * @returns TrafficData - Mock traffic data
   */
  private getMockTrafficData(route: DeliveryRoute): TrafficData {
    const baseDelayMinutes = Math.floor(Math.random() * 60);
    const normalDurationMinutes = 120;
    const currentDurationMinutes = normalDurationMinutes + baseDelayMinutes;

    let trafficCondition: 'light' | 'moderate' | 'heavy' | 'severe';
    if (baseDelayMinutes < 15) {
      trafficCondition = 'light';
    } else if (baseDelayMinutes < 30) {
      trafficCondition = 'moderate';
    } else if (baseDelayMinutes < 45) {
      trafficCondition = 'heavy';
    } else {
      trafficCondition = 'severe';
    }

    const mockData: TrafficData = {
      estimatedDelayMinutes: baseDelayMinutes,
      normalDurationMinutes,
      currentDurationMinutes,
      trafficCondition,
      route,
    };

    console.log('Mock traffic data generated:', {
      delay: `${baseDelayMinutes} minutes`,
      condition: trafficCondition,
      normalDuration: `${normalDurationMinutes} minutes`,
      currentDuration: `${currentDurationMinutes} minutes`,
    });

    return mockData;
  }

  /**
   * Validates if a route has the minimum required information
   * @param route - The delivery route to validate
   * @returns boolean - Whether the route is valid
   */
  validateRoute(route: DeliveryRoute): boolean {
    return !!(
      route.origin &&
      route.destination &&
      route.origin.trim().length > 0 &&
      route.destination.trim().length > 0
    );
  }

  /**
   * Simulates actual Google Maps API integration
   * This method shows how you would integrate with the real API
   * @param route - The delivery route
   * @returns Promise<TrafficData> - Would return real traffic data
   */
  private async getRealTrafficData(route: DeliveryRoute): Promise<TrafficData> {
    // Example of how to integrate with Google Maps API:
    //
    // const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?` +
    //   `origin=${encodeURIComponent(route.origin)}&` +
    //   `destination=${encodeURIComponent(route.destination)}&` +
    //   `departure_time=now&` +
    //   `traffic_model=best_guess&` +
    //   `key=${this.apiKey}`);
    //
    // const data = await response.json();
    //
    // if (data.status !== 'OK' || !data.routes.length) {
    //   throw new Error(`Google Maps API error: ${data.status}`);
    // }
    //
    // const routeData = data.routes[0];
    // const leg = routeData.legs[0];
    //
    // const normalDurationMinutes = Math.round(leg.duration.value / 60);
    // const trafficDurationMinutes = leg.duration_in_traffic?.value
    //   ? Math.round(leg.duration_in_traffic.value / 60)
    //   : normalDurationMinutes;
    //
    // const estimatedDelayMinutes = Math.max(0, trafficDurationMinutes - normalDurationMinutes);
    //
    // return {
    //   estimatedDelayMinutes,
    //   normalDurationMinutes,
    //   currentDurationMinutes: trafficDurationMinutes,
    //   trafficCondition: this.calculateTrafficCondition(estimatedDelayMinutes, normalDurationMinutes),
    //   route
    // };

    // For now, return mock data
    return this.getMockTrafficData(route);
  }
}
