export interface Clip {
  id: string;
  videoUrl: string;
  duration: number;
  subtitle: string;
  startTime: number;
  endTime: number;
}

export interface GenerateResponse {
  clips: Clip[];
  error?: string;
}
