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

export type TimelineParams = {
  location: string;
  date1?: string | undefined;
  date2?: string | undefined;
};
