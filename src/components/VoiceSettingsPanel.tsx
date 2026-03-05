import React from 'react';
import { CouncilMember } from '../constants';
import { Sliders, Volume2, Activity, Zap } from 'lucide-react';

interface VoiceSettingsPanelProps {
  host: CouncilMember;
  onUpdate: (settings: CouncilMember['settings']) => void;
}

export default function VoiceSettingsPanel({ host, onUpdate }: VoiceSettingsPanelProps) {
  const handleChange = (key: keyof CouncilMember['settings'], value: number) => {
    onUpdate({ ...host.settings, [key]: value });
  };

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <img src={host.avatar} alt={host.name} className="w-6 h-6 rounded-full grayscale" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{host.name} Voice</span>
      </div>

      <div className="space-y-3">
        {/* Pitch */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase">
            <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> Pitch</span>
            <span>{host.settings.pitch.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="1.5" 
            step="0.1"
            value={host.settings.pitch}
            onChange={(e) => handleChange('pitch', parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Rate */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Rate</span>
            <span>{host.settings.rate.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="2.0" 
            step="0.1"
            value={host.settings.rate}
            onChange={(e) => handleChange('rate', parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Formant */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Formant</span>
            <span>{host.settings.formant.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="1.5" 
            step="0.1"
            value={host.settings.formant}
            onChange={(e) => handleChange('formant', parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
