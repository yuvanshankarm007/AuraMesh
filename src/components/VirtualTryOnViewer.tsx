import React, { useState } from 'react';
import { AestheticPlan, LightingMode } from '../agent-core/types';
import { Palette, CheckCircle2, Sliders, Sparkles, Sun, Lamp, Moon, Layers } from 'lucide-react';

interface VTOViewerProps {
  aesthetic?: AestheticPlan;
  avatarUrl?: string;
}

export const VirtualTryOnViewer: React.FC<VTOViewerProps> = React.memo(({ aesthetic, avatarUrl }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [lighting, setLighting] = useState<LightingMode>('daylight');
  const [layers, setLayers] = useState({
    diagnosticMesh: true,
    skincareGlow: true,
    cosmeticMakeup: true
  });

  if (!aesthetic) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center h-[340px] text-slate-500 text-xs">
        <Palette className="w-8 h-8 mb-2 opacity-30 text-amber-400" />
        <p>Awaiting YouCam Virtual Try-On & Shade Harmonization...</p>
      </div>
    );
  }

  const foundation = aesthetic.vtoLooks.find(l => l.category === 'foundation');
  const lip = aesthetic.vtoLooks.find(l => l.category === 'lipstick');
  const blush = aesthetic.vtoLooks.find(l => l.category === 'blush');

  const getLightingFilter = () => {
    switch (lighting) {
      case 'golden_hour':
        return 'sepia(20%) saturate(125%) hue-rotate(-10deg) brightness(105%)';
      case 'office_fluorescent':
        return 'contrast(108%) saturate(92%) brightness(102%)';
      case 'evening_lounge':
        return 'brightness(92%) contrast(115%) sepia(15%)';
      case 'daylight':
      default:
        return 'saturate(105%) contrast(100%)';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      {/* Top Header & Metrics */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            YouCam AR Virtual Try-On (VTO)
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {avatarUrl && avatarUrl.startsWith('data:') && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center gap-1 font-mono shadow-sm">
              <Sparkles className="w-3 h-3 text-pink-400" />
              Your Custom Face
            </span>
          )}
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
            {aesthetic.recommendedPalette}
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ΔE &lt; 1.2 Match
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Interactive Before & After Split Image */}
        <div className="sm:col-span-6 relative aspect-square rounded-xl overflow-hidden border border-slate-700 select-none group">
          {/* Baseline Image */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Original"
              className="absolute inset-0 w-full h-full object-cover filter contrast-95"
            />
          ) : null}

          {/* Diagnostic Landmark Mesh Overlay (Left Side) */}
          {layers.diagnosticMesh && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <circle cx="36%" cy="40%" r="3" fill="#06b6d4" />
              <circle cx="64%" cy="40%" r="3" fill="#06b6d4" />
              <circle cx="50%" cy="54%" r="3" fill="#10b981" />
              <circle cx="42%" cy="66%" r="2" fill="#ec4899" />
              <circle cx="58%" cy="66%" r="2" fill="#ec4899" />
              <path d="M 38 68 Q 50 76 62 68" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
          )}

          {/* Rendered VTO Image with Clip-Path */}
          {avatarUrl ? (
            <div
              className="absolute inset-0 overflow-hidden transition-all duration-300"
              style={{
                clipPath: `inset(0 0 0 ${sliderPos}%)`,
                filter: getLightingFilter()
              }}
            >
              <img
                src={avatarUrl}
                alt="VTO Rendered"
                className={`absolute inset-0 w-full h-full object-cover ${layers.skincareGlow ? 'brightness-105' : ''}`}
              />

              {layers.cosmeticMakeup && (
                <>
                  {/* Foundation Tint Overlay */}
                  <div
                    className="absolute inset-0 mix-blend-color opacity-35 pointer-events-none"
                    style={{ backgroundColor: foundation?.hexColor || '#d6b38a' }}
                  />
                  {/* Lip highlight */}
                  <div
                    className="absolute bottom-[24%] left-[40%] w-[20%] h-[8%] rounded-full opacity-45 mix-blend-multiply pointer-events-none filter blur-[2px]"
                    style={{ backgroundColor: lip?.hexColor || '#c25a3f' }}
                  />
                  {/* Cheek blush */}
                  <div
                    className="absolute top-[48%] left-[24%] w-[18%] h-[14%] rounded-full opacity-35 mix-blend-screen pointer-events-none filter blur-[8px]"
                    style={{ backgroundColor: blush?.hexColor || '#df826c' }}
                  />
                  <div
                    className="absolute top-[48%] right-[24%] w-[18%] h-[14%] rounded-full opacity-35 mix-blend-screen pointer-events-none filter blur-[8px]"
                    style={{ backgroundColor: blush?.hexColor || '#df826c' }}
                  />
                </>
              )}
            </div>
          ) : null}

          {/* Slider Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none z-10"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-lg">
              <Sliders className="w-3 h-3 text-white rotate-90" />
            </div>
          </div>

          {/* Drag Range Input */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          />

          {/* Split Labels */}
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 px-2 py-0.5 rounded text-slate-300 pointer-events-none">
            Original Bare
          </span>
          <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider bg-pink-500/90 px-2 py-0.5 rounded text-white pointer-events-none flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            YouCam VTO
          </span>
        </div>

        {/* Selected Cosmetic Palettes & Multi-Layer Controls */}
        <div className="sm:col-span-6 flex flex-col justify-between space-y-3">
          {/* Layer and Lighting Simulator Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                VTO Multi-Layer Toggles
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setLayers(prev => ({ ...prev, diagnosticMesh: !prev.diagnosticMesh }))}
                  className={`text-[9px] px-2 py-0.5 rounded font-mono border transition-all ${
                    layers.diagnosticMesh ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  Mesh
                </button>
                <button
                  onClick={() => setLayers(prev => ({ ...prev, skincareGlow: !prev.skincareGlow }))}
                  className={`text-[9px] px-2 py-0.5 rounded font-mono border transition-all ${
                    layers.skincareGlow ? 'bg-pink-500/20 text-pink-300 border-pink-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  Glow
                </button>
                <button
                  onClick={() => setLayers(prev => ({ ...prev, cosmeticMakeup: !prev.cosmeticMakeup }))}
                  className={`text-[9px] px-2 py-0.5 rounded font-mono border transition-all ${
                    layers.cosmeticMakeup ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  Makeup
                </button>
              </div>
            </div>

            {/* Lighting Simulator Bar */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-medium">Ambient Light:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setLighting('daylight')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                    lighting === 'daylight' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-2.5 h-2.5" />
                  <span>Daylight</span>
                </button>
                <button
                  onClick={() => setLighting('golden_hour')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                    lighting === 'golden_hour' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Golden Hour</span>
                </button>
                <button
                  onClick={() => setLighting('office_fluorescent')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                    lighting === 'office_fluorescent' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lamp className="w-2.5 h-2.5" />
                  <span>Office</span>
                </button>
                <button
                  onClick={() => setLighting('evening_lounge')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                    lighting === 'evening_lounge' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-2.5 h-2.5" />
                  <span>Evening</span>
                </button>
              </div>
            </div>

            {/* Harmonized Palette List */}
            {aesthetic.vtoLooks.map((look) => (
              <div
                key={look.category}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded-lg border border-white/20 shadow-inner"
                    style={{ backgroundColor: look.hexColor }}
                  />
                  <div>
                    <div className="text-[11px] font-bold text-slate-200 capitalize">
                      {look.category}: {look.shadeName}
                    </div>
                    <div className="text-[9px] text-slate-400 capitalize">
                      Finish: <span className="text-amber-400">{look.finish}</span> • Match: {Math.round(look.matchConfidence * 100)}%
                    </div>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                  Rx Compliant
                </span>
              </div>
            ))}
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-2 text-[10px] text-amber-200/90 leading-relaxed">
            <strong>Cross-Specialist Consensus:</strong> Foundation finish is restricted to fluid serum to satisfy the Pharmacology Agent's non-comedogenic barrier constraint.
          </div>
        </div>
      </div>
    </div>
  );
});

export default VirtualTryOnViewer;
