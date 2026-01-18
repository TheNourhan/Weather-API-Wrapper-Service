export interface WeatherData {
  temp: number;
  humidity: number;
  description: string;
  city: string;
}

export interface VisualCrossingResponse {
  days: Array<{
    temp: number;
    humidity: number;
    conditions: string;
  }>;
  resolvedAddress: string;
}
