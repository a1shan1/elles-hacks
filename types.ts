export interface SearchParams {
  query: string;
  vibe: VibeType;
  category: CategoryType;
  radius: string; // e.g., "1km", "5km"
}

export enum VibeType {
  ANY = 'Any Vibe',
  CHILL = 'Chill & Quiet',
  SOCIAL = 'Social & Loud',
  NETWORKING = 'Professional',
  RETRO = 'Retro & Cozy',
  LATE_NIGHT = 'Late Night Grind'
}

export enum CategoryType {
  ANY = 'Anything',
  CAFE = 'Cafe',
  LIBRARY = 'Library',
  BAR = 'Bar/Pub',
  PARK = 'Outdoor/Park',
  EVENT_SPACE = 'Event Space'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            content: string;
        }[]
    }
  };
}

export interface Place {
  name: string;
  lat: number;
  lng: number;
  description: string;
  address: string;
  tags?: string[];
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  groundingChunks?: GroundingChunk[];
}

export interface GeminiResult {
  text: string;
  groundingChunks?: GroundingChunk[];
}