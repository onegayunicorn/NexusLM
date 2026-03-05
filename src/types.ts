import { CouncilMember } from './constants';

export interface ScriptTurn {
  speaker: string;
  text: string;
  emotion: string;
  audio?: string;
}

export interface PodcastScript {
  lines: ScriptTurn[];
  totalDuration?: number;
}

export interface AudioSegment extends ScriptTurn {
  buffer: AudioBuffer;
  duration: number;
}

export type PodcastStatus = 'idle' | 'analyzing' | 'generating' | 'synthesizing' | 'ready' | 'playing' | 'error' | 'completed';
