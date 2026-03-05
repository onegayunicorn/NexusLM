import { ScriptTurn } from '../types';

export class PodcastService {
  static async analyzeDocument(file: File, host1: string, host2: string, isMockMode: boolean): Promise<{ script: ScriptTurn[], text: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('host1', host1);
    formData.append('host2', host2);
    formData.append('isMockMode', String(isMockMode));

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    // Circuit Breaker: Binary validation and header checks
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text);
      throw new Error(`Server returned non-JSON response (${response.status}). This often means the server crashed or the route was not found.`);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Analysis failed');
    }

    if (!data.script || !Array.isArray(data.script)) {
      throw new Error('Invalid script format received from server');
    }

    return data;
  }

  static async synthesizeSpeech(text: string, speaker: string, settings: any, isMockMode: boolean): Promise<string> {
    const response = await fetch('/api/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speaker, settings, isMockMode }),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Synthesis failed: Server returned non-JSON response');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Synthesis failed');
    }

    return `data:audio/mp3;base64,${data.audio}`;
  }
}
