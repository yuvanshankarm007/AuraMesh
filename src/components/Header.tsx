import React from 'react';
import { Sparkles, Cpu, ShieldCheck, Key, RefreshCw, Layers, Gauge, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenApiKey: () => void;
  onReset: () => void;
  isSimulated: boolean;
  executionSpeed: 'realistic' | 'instant';
  onToggleSpeed: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  onOpenApiKey,
  onReset,
  isSimulated,
  executionSpeed,
  onToggleSpeed
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Architecture Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-[2px] shadow-lg shadow-pink-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-200 to-amber-200">
                AuraMesh AI
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                YouCam Hackathon
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-cyan-400" />
              Bidirectional Multi-Agent Web • Horizontal & Vertical Specialization
            </p>
          </div>
        </div>

        {/* System Telemetry & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Execution Speed Toggle */}
          <button
            onClick={onToggleSpeed}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              executionSpeed === 'realistic'
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
            title="Toggle between Human-Paced Visualization (380ms/hop) and Instant Execution"
          >
            {executionSpeed === 'realistic' ? (
              <>
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Paced Demo (380ms)</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Instant Mode</span>
              </>
            )}
          </button>

          {/* API Status Badge */}
          <button
            onClick={onOpenApiKey}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              isSimulated
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isSimulated ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Zero-Crash Guard</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Live YouCam API</span>
              </>
            )}
            <Key className="w-3 h-3 ml-1 opacity-70" />
          </button>

          {/* Reset Session */}
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset Agent Web"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export const Header = React.memo(HeaderComponent);
