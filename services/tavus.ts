export interface TavusPersona {
  persona_id: string;
  persona_name: string;
  persona_thumbnail_url?: string;
}

export interface TavusVideoResponse {
  video_id: string;
  video_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export class TavusService {
  private apiKey: string;
  private baseUrl = 'https://tavusapi.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createPersona(name: string, videoUrl: string): Promise<TavusPersona> {
    const response = await fetch(`${this.baseUrl}/personas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify({
        persona_name: name,
        video_url: videoUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create persona: ${response.statusText}`);
    }

    return response.json();
  }

  async generateVideo(
    personaId: string,
    script: string,
    metadata?: Record<string, any>
  ): Promise<TavusVideoResponse> {
    const response = await fetch(`${this.baseUrl}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify({
        persona_id: personaId,
        script,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate video: ${response.statusText}`);
    }

    return response.json();
  }

  async getVideoStatus(videoId: string): Promise<TavusVideoResponse> {
    const response = await fetch(`${this.baseUrl}/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get video status: ${response.statusText}`);
    }

    return response.json();
  }

  async listPersonas(): Promise<TavusPersona[]> {
    const response = await fetch(`${this.baseUrl}/personas`, {
      method: 'GET',
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list personas: ${response.statusText}`);
    }

    const data = await response.json();
    return data.personas || [];
  }
}

export const createTavusClient = (apiKey: string) => {
  return new TavusService(apiKey);
};
