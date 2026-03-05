import React from 'react';
import { CouncilMember, COUNCIL_MEMBERS } from '../constants';
import { cn } from '../lib/utils';

interface HostSelectorProps {
  position: 1 | 2;
  selectedHost: CouncilMember | null;
  onSelect: (host: CouncilMember) => void;
  excludeHost?: string;
  disabled?: boolean;
}

export default function HostSelector({ position, selectedHost, onSelect, excludeHost, disabled }: HostSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        Host {position}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {COUNCIL_MEMBERS.map((member) => (
          <button
            key={member.id}
            disabled={disabled || member.id === excludeHost}
            onClick={() => onSelect(member)}
            className={cn(
              "relative p-3 rounded-xl border transition-all text-left group overflow-hidden",
              selectedHost?.id === member.id 
                ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/50" 
                : "bg-zinc-800/30 border-zinc-700 hover:border-zinc-500",
              member.id === excludeHost && "opacity-30 cursor-not-allowed grayscale"
            )}
          >
            <div className="flex items-center gap-3 relative z-10">
              <img 
                src={member.avatar} 
                alt={member.name} 
                className={cn(
                  "w-8 h-8 rounded-full object-cover grayscale transition-all",
                  selectedHost?.id === member.id && "grayscale-0"
                )} 
              />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{member.name}</p>
                <p className="text-[9px] text-zinc-500 truncate">{member.archetype}</p>
              </div>
            </div>
            {selectedHost?.id === member.id && (
              <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
