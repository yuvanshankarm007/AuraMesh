import React, { useState } from 'react';
import { SkinDiagnosticScores } from '../agent-core/types';
import { Activity, Clock } from 'lucide-react';
import { ChronoSkinProgress } from './ChronoSkinProgress';

interface RadarProps {
  scores?: SkinDiagnosticScores;
  avatarUrl?: string;
}

const SkinAnalysisRadarComponent: React.FC<RadarProps> = ({ scores, avatarUrl }) => {
  const [activeTab, setActiveTab] = useState<'realtime' | 'chronoskin'>('realtime');

  if (!scores) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center h-[340px] text-slate-500 text-xs">
        <Activity className="w-8 h-8 mb-2 opacity-30 text-cyan-400" />
        <p>Awaiting YouCam Skin Analysis results...</p>
      </div>
    );
  }

  const metrics = [
    { label: 'Acne & Blemishes', val: scores.acne, color: 'bg-rose-500' },
    { label: 'Pore Refinement', val: scores.pores, color: 'bg-amber-500' },
    { label: 'Surface Texture', val: scores.texture, color: 'bg-emerald-500' },
    { label: 'Wrinkle Elasticity', val: scores.wrinkles, color: 'bg-purple-500' },
    { label: 'Tone Uniformity', val: scores.spots, color: 'bg-blue-500' },
    { label: 'Dark Circles', val: scores.darkCircles, color: 'bg-indigo-500' },
    { label: 'Erythema (Redness)', val: scores.redness, color: 'bg-red-500' }
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 flex-wrap gap-2">
        {/* Tab Switcher */}
        <div className="flex space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('realtime')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'realtime'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>YouCam Live Telemetry</span>
          </button>
          <button
            onClick={() => setActiveTab('chronoskin')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'chronoskin'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span>ChronoSkin™ 30-Day Efficacy</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            Age: {scores.skinAge} yrs
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            scores.barrierHealth === 'intact'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}>
            Barrier: {scores.barrierHealth.toUpperCase()}
          </span>
        </div>
      </div>

      {activeTab === 'chronoskin' ? (
        <ChronoSkinProgress scores={scores} avatarUrl={avatarUrl} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Face Thumbnail with Simulated Landmark Mesh */}
          <div className="sm:col-span-4 relative group">
            <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-square">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt="Subject face"
                  className="w-full h-full object-cover"
                />
              )}
              {/* SVG Landmark Overlay Simulation */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                <circle cx="35%" cy="40%" r="4" fill="#06b6d4" className="animate-pulse" />
                <circle cx="65%" cy="40%" r="4" fill="#06b6d4" className="animate-pulse" />
                <circle cx="50%" cy="55%" r="3" fill="#10b981" />
                <path d="M 38 70 Q 50 78 62 70" fill="none" stroke="#ec4899" strokeWidth="2" />
                <ellipse cx="50%" cy="50%" rx="35%" ry="45%" fill="none" stroke="#06b6d4" strokeDasharray="3 3" strokeWidth="1" />
              </svg>
              <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-sm rounded-lg p-1.5 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-300 font-medium">
                  Undertone: <strong className="text-pink-400 capitalize">{scores.undertone}</strong> (Type {scores.fitzpatrickScale})
                </span>
              </div>
            </div>
          </div>

          {/* Diagnostic Score Bars */}
          <div className="sm:col-span-8 space-y-2.5">
            {metrics.map((m) => (
              <div key={m.label} className="text-xs">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300 font-medium">{m.label}</span>
                  <span className="font-mono text-slate-400 font-semibold">{m.val}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${m.color} transition-all duration-700 rounded-full`}
                    style={{ width: `${m.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const SkinAnalysisRadar = React.memo(SkinAnalysisRadarComponent);
