export interface Clip {
  id: string;
  videoUrl: string;
  downloadUrl?: string;
  duration: number;
  subtitle: string;
  startTime: number;
  endTime: number;
}

export interface GenerateResponse {
  clips: Clip[];
  error?: string;
}
