import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Settings, 
  FileText, 
  Mic2, 
  Sparkles,
  ChevronRight,
  Volume2,
  Loader2,
  History
} from 'lucide-react';
import { COUNCIL_MEMBERS, CouncilMember, ScriptTurn } from './constants';
import { cn } from './lib/utils';

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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
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
      const data = await response.json();
      if (data.script) {
        setScript(data.script);
        setCurrentTurnIndex(0);
      }
    } catch (error) {
      console.error('Analysis failed', error);
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
        const data = await response.json();
        audioSrc = `data:audio/mp3;base64,${data.audio}`;
        setAudioCache(prev => ({ ...prev, [index]: audioSrc }));
      } catch (error) {
        console.error('Synthesis failed', error);
        setIsPlaying(false);
        return;
      } finally {
        setIsSynthesizing(false);
      }
    }

    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.play();
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (currentTurnIndex === -1 && script.length > 0) {
        playTurn(0);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-emerald-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
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
          <nav className="flex items-center gap-8 text-sm font-medium text-zinc-400">
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
              
              <label className="group relative block cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt,.md"
                />
                <div className={cn(
                  "border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center",
                  file ? "border-emerald-500/50 bg-emerald-500/5" : "border-zinc-700 group-hover:border-zinc-500 bg-zinc-800/30"
                )}>
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200">
                      {file ? file.name : "Drop your document here"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">PDF, DOCX, TXT, MD up to 50MB</p>
                  </div>
                </div>
              </label>

              <div className="mt-8 space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 block">Select Hosts</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Host 1</p>
                      <select 
                        value={host1.id}
                        onChange={(e) => setHost1(COUNCIL_MEMBERS.find(m => m.id === e.target.value)!)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        {COUNCIL_MEMBERS.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Host 2</p>
                      <select 
                        value={host2.id}
                        onChange={(e) => setHost2(COUNCIL_MEMBERS.find(m => m.id === e.target.value)!)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        {COUNCIL_MEMBERS.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

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
                    <div>
                      <p className="text-sm font-bold truncate">{host.name}</p>
                      <p className="text-[10px] text-zinc-500">{host.archetype}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Player & Transcript */}
          <div className="lg:col-span-8 space-y-8">
            {/* Main Player Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-12 flex flex-col items-center text-center">
                <div className="relative mb-12">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
                  <div className="relative w-48 h-48 rounded-full border-4 border-zinc-800 p-2">
                    <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {currentTurnIndex >= 0 ? (
                        <motion.img 
                          key={script[currentTurnIndex]?.speaker}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          src={COUNCIL_MEMBERS.find(m => m.name === script[currentTurnIndex]?.speaker)?.avatar} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <History className="w-16 h-16 text-zinc-700" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-12">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {file ? file.name.replace(/\.[^/.]+$/, "") : "No Document Loaded"}
                  </h2>
                  <p className="text-zinc-500">
                    Featuring {host1.name} & {host2.name}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8">
                  <button className="text-zinc-500 hover:text-white transition-colors">
                    <SkipBack className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    disabled={script.length === 0}
                    className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                  </button>
                  <button className="text-zinc-500 hover:text-white transition-colors">
                    <SkipForward className="w-8 h-8" />
                  </button>
                </div>

                {/* Progress Bar (Mock) */}
                <div className="w-full mt-12 space-y-2">
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: script.length > 0 ? `${((currentTurnIndex + 1) / script.length) * 100}%` : 0 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <span>{currentTurnIndex + 1} / {script.length} segments</span>
                    <span>{isSynthesizing ? "Buffering..." : "Live Feed"}</span>
                  </div>
                </div>
              </div>

              {/* Transcript Area */}
              <div className="bg-black/50 border-t border-zinc-800 p-8 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  {script.length === 0 && !isAnalyzing && (
                    <div className="text-center py-12 text-zinc-600">
                      <p>Upload a document to generate a dialogue</p>
                    </div>
                  )}
                  {isAnalyzing && (
                    <div className="flex flex-col items-center py-12 gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                      <p className="text-zinc-400 animate-pulse">Consulting the Council of Great Minds...</p>
                    </div>
                  )}
                  <AnimatePresence mode="popLayout">
                    {script.map((turn, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: currentTurnIndex === i ? 1 : 0.4,
                          scale: currentTurnIndex === i ? 1 : 0.98
                        }}
                        className={cn(
                          "p-6 rounded-2xl transition-all duration-500",
                          currentTurnIndex === i ? "bg-zinc-800/50 border border-zinc-700" : "bg-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            COUNCIL_MEMBERS.find(m => m.name === turn.speaker)?.color || "bg-zinc-500"
                          )} />
                          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{turn.speaker}</span>
                          <span className="text-[10px] text-zinc-600 italic ml-auto">{turn.emotion}</span>
                        </div>
                        <p className="text-zinc-200 leading-relaxed">
                          {turn.text}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
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
