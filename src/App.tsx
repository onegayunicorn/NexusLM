import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Mic2, Loader2, FileText, History, AlertCircle } from 'lucide-react';
import { COUNCIL_MEMBERS, CouncilMember } from './constants';
import { ScriptTurn } from './types';
import { cn } from './lib/utils';
import HostSelector from './components/HostSelector';
import DocumentUploader from './components/DocumentUploader';
import PodcastPlayer from './components/PodcastPlayer';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [host1, setHost1] = useState<CouncilMember>(COUNCIL_MEMBERS[0]);
  const [host2, setHost2] = useState<CouncilMember>(COUNCIL_MEMBERS[3]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [script, setScript] = useState<ScriptTurn[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCache, setAudioCache] = useState<Record<number, string>>({});
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setScript([]);
    setCurrentTurnIndex(-1);
    setAudioCache({});

    const formData = new FormData();
    formData.append('file', file);
    formData.append('host1', host1.name);
    formData.append('host2', host2.name);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      const data = await response.json();
      if (data.script && Array.isArray(data.script)) {
        setScript(data.script);
        setCurrentTurnIndex(0);
      } else {
        throw new Error('Invalid script format received');
      }
    } catch (err: any) {
      console.error('Analysis failed', err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playTurn = async (index: number) => {
    if (index < 0 || index >= script.length) {
      setIsPlaying(false);
      return;
    }

    setCurrentTurnIndex(index);
    setIsPlaying(true);

    let audioSrc = audioCache[index];

    if (!audioSrc) {
      setIsSynthesizing(true);
      try {
        const response = await fetch('/api/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: script[index].text,
            speaker: script[index].speaker
          }),
        });
        
        if (!response.ok) throw new Error('Synthesis failed');
        
        const data = await response.json();
        audioSrc = `data:audio/mp3;base64,${data.audio}`;
        setAudioCache(prev => ({ ...prev, [index]: audioSrc }));
      } catch (err) {
        console.error('Synthesis failed', err);
        setIsPlaying(false);
        return;
      } finally {
        setIsSynthesizing(false);
      }
    }

    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.play().catch(e => {
        console.error("Playback error:", e);
        setIsPlaying(false);
      });
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (currentTurnIndex === -1 && script.length > 0) {
        playTurn(0);
      } else if (currentTurnIndex >= 0) {
        if (audioRef.current?.src) {
           audioRef.current.play();
           setIsPlaying(true);
        } else {
           playTurn(currentTurnIndex);
        }
      }
    }
  };

  const handleSkip = (direction: 'forward' | 'backward') => {
    const nextIndex = direction === 'forward' ? currentTurnIndex + 1 : currentTurnIndex - 1;
    if (nextIndex >= 0 && nextIndex < script.length) {
      playTurn(nextIndex);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (currentTurnIndex < script.length - 1) {
        playTurn(currentTurnIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentTurnIndex, script]);

  const progress = script.length > 0 ? ((currentTurnIndex + 1) / script.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-emerald-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="text-black w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tighter">NEXUS<span className="text-emerald-500">LM</span></h1>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <button className="hover:text-white transition-colors">Library</button>
            <button className="hover:text-white transition-colors">Council</button>
            <button className="hover:text-white transition-colors">Settings</button>
          </nav>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Ingest Document
              </h2>
              
              <DocumentUploader 
                onDocumentUpload={setFile}
                isDisabled={isAnalyzing}
                currentFile={file}
              />

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="mt-8 space-y-6">
                <HostSelector 
                  position={1}
                  selectedHost={host1}
                  onSelect={setHost1}
                  excludeHost={host2.id}
                  disabled={isAnalyzing}
                />
                
                <HostSelector 
                  position={2}
                  selectedHost={host2}
                  onSelect={setHost2}
                  excludeHost={host1.id}
                  disabled={isAnalyzing}
                />

                <button 
                  onClick={startAnalysis}
                  disabled={!file || isAnalyzing}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Mic2 className="w-5 h-5" />
                      Generate Podcast
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Council Preview */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Active Council</h3>
              <div className="flex gap-4">
                {[host1, host2].map((host, i) => (
                  <div key={i} className="flex-1 bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
                    <img src={host.avatar} alt={host.name} className="w-10 h-10 rounded-full object-cover grayscale hover:grayscale-0 transition-all" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{host.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{host.archetype}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Player & Transcript */}
          <div className="lg:col-span-8">
            <PodcastPlayer 
              script={script}
              currentTurnIndex={currentTurnIndex}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onSkip={handleSkip}
              isSynthesizing={isSynthesizing}
              progress={progress}
            />
          </div>
        </div>
      </main>

      <audio ref={audioRef} className="hidden" />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
