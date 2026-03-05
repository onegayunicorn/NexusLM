import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Loader2, Sparkles } from 'lucide-react';
import { ScriptTurn } from '../types';
import { COUNCIL_MEMBERS } from '../constants';
import { cn } from '../lib/utils';

interface PodcastPlayerProps {
  script: ScriptTurn[];
  currentTurnIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSkip: (direction: 'forward' | 'backward') => void;
  isSynthesizing: boolean;
  progress: number;
}

export default function PodcastPlayer({ 
  script, 
  currentTurnIndex, 
  isPlaying, 
  onTogglePlay, 
  onSkip,
  isSynthesizing,
  progress
}: PodcastPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentTurn = script[currentTurnIndex];
  const currentHost = currentTurn ? COUNCIL_MEMBERS.find(m => m.name === currentTurn.speaker) : null;

  // Waveform animation
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bars = 60;
    const barWidth = 4;
    const barGap = 2;
    const heights = Array(bars).fill(0).map(() => Math.random() * 20 + 5);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isPlaying ? '#10b981' : '#3f3f46';
      
      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + barGap);
        let h = heights[i];
        
        if (isPlaying) {
          h = Math.max(5, h + (Math.random() - 0.5) * 10);
          heights[i] = h;
        }
        
        const y = (canvas.height - h) / 2;
        ctx.fillRect(x, y, barWidth, h);
      }
      
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-8 lg:p-12 flex flex-col items-center text-center">
        {/* Host Avatar Visualization */}
        <div className="relative mb-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentHost?.id || 'idle'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-full border-4 border-zinc-800 p-2"
            >
              <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full animate-pulse" />
              <div className="relative w-full h-full rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                {currentHost ? (
                  <img 
                    src={currentHost.avatar} 
                    alt={currentHost.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles className="w-16 h-16 text-zinc-700" />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
          
          {isPlaying && (
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Volume2 className="w-5 h-5 text-black animate-pulse" />
            </div>
          )}
        </div>

        <div className="space-y-2 mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {currentHost ? currentHost.name : "NexusLM Podcast"}
          </h2>
          <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold">
            {currentHost ? currentHost.archetype : "Awaiting Ingestion"}
          </p>
        </div>

        {/* Waveform */}
        <div className="w-full max-w-md mb-10">
          <canvas 
            ref={canvasRef} 
            width={360} 
            height={60} 
            className="w-full h-12"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 mb-10">
          <button 
            onClick={() => onSkip('backward')}
            className="text-zinc-500 hover:text-white transition-colors p-2"
          >
            <SkipBack className="w-8 h-8" />
          </button>
          
          <button 
            onClick={onTogglePlay}
            disabled={script.length === 0}
            className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-xl"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>
          
          <button 
            onClick={() => onSkip('forward')}
            className="text-zinc-500 hover:text-white transition-colors p-2"
          >
            <SkipForward className="w-8 h-8" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-3">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <span>{currentTurnIndex + 1} / {script.length} segments</span>
            <span className="flex items-center gap-2">
              {isSynthesizing && <Loader2 className="w-3 h-3 animate-spin" />}
              {isSynthesizing ? "Synthesizing..." : "Live Feed"}
            </span>
          </div>
        </div>
      </div>

      {/* Transcript Area */}
      <div className="bg-black/40 border-t border-zinc-800 p-8 max-h-[300px] overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
          {script.length === 0 ? (
            <div className="text-center py-8 text-zinc-600">
              <p className="text-sm">Upload a document to begin the dialogue</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {script.map((turn, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: currentTurnIndex === i ? 1 : 0.3,
                    scale: currentTurnIndex === i ? 1 : 0.98
                  }}
                  className={cn(
                    "p-5 rounded-2xl transition-all duration-500",
                    currentTurnIndex === i ? "bg-zinc-800/50 border border-zinc-700" : "bg-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      COUNCIL_MEMBERS.find(m => m.name === turn.speaker)?.color || "bg-zinc-500"
                    )} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{turn.speaker}</span>
                    <span className="text-[9px] text-zinc-600 italic ml-auto">{turn.emotion}</span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {turn.text}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
