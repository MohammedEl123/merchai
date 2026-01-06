export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface MockupState {
  bgImage: string; // Data URL or remote URL
  logoImage: string | null; // Data URL
  logoX: number;
  logoY: number;
  logoScale: number;
}
