export interface VideoFormat {
  quality: string;
  qualityLabel: string;
  container: string;
  hasVideo: boolean;
  hasAudio: boolean;
  url: string;
  mimeType: string;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  formats: VideoFormat[];
  audioFormats: VideoFormat[];
}

export interface ApiError {
  error: string;
}
