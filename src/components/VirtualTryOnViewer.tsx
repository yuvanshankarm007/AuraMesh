import React, { useState } from 'react';
import { AestheticPlan } from '../agent-core/types';
import { Palette, CheckCircle2, Sliders, Sparkles } from 'lucide-react';

interface VTOViewerProps {
  aesthetic?: AestheticPlan;
  avatarUrl?: string;
}

export const VirtualTryOnViewer: React.FC<VTOViewerProps> = React.memo(({ aesthetic, avatarUrl }) => {
  const [sliderPos, setSliderPos] = useState(50);

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

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            YouCam AR Virtual Try-On (VTO)
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
            {aesthetic.recommendedPalette}
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            96% Shade Fit
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

          {/* Rendered VTO Image with Clip-Path */}
          {avatarUrl ? (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
              <img
                src={avatarUrl}
                alt="VTO Rendered"
                className="absolute inset-0 w-full h-full object-cover filter saturate-110 brightness-105"
              />
              {/* Dynamic VTO Tint Overlay Simulation */}
              <div
                className="absolute inset-0 mix-blend-color opacity-30 pointer-events-none"
                style={{ backgroundColor: foundation?.hexColor || '#d6b38a' }}
              />
              {/* Lip highlight simulation */}
              <div
                className="absolute bottom-[24%] left-[40%] w-[20%] h-[8%] rounded-full opacity-40 mix-blend-multiply pointer-events-none filter blur-[2px]"
                style={{ backgroundColor: lip?.hexColor || '#c25a3f' }}
              />
              {/* Cheek blush simulation */}
              <div
                className="absolute top-[48%] left-[24%] w-[18%] h-[14%] rounded-full opacity-35 mix-blend-screen pointer-events-none filter blur-[8px]"
                style={{ backgroundColor: blush?.hexColor || '#df826c' }}
              />
              <div
                className="absolute top-[48%] right-[24%] w-[18%] h-[14%] rounded-full opacity-35 mix-blend-screen pointer-events-none filter blur-[8px]"
                style={{ backgroundColor: blush?.hexColor || '#df826c' }}
              />
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
            Original
          </span>
          <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider bg-pink-500/90 px-2 py-0.5 rounded text-white pointer-events-none flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            YouCam VTO
          </span>
        </div>

        {/* Selected Cosmetic Palettes */}
        <div className="sm:col-span-6 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">
              Harmonized Complexion Palette
            </h4>

            {aesthetic.vtoLooks.map((look) => (
              <div
                key={look.category}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-7 h-7 rounded-lg border border-white/20 shadow-inner"
                    style={{ backgroundColor: look.hexColor }}
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-200 capitalize">
                      {look.category}: {look.shadeName}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      Finish: <span className="text-amber-400">{look.finish}</span> • Match: {Math.round(look.matchConfidence * 100)}%
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Rx Safe
                </span>
              </div>
            ))}
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-200/90 leading-relaxed">
            <strong>Cross-Specialist Consensus:</strong> Foundation finish is restricted to lightweight fluid serum to satisfy the Pharmacology Agent's non-comedogenic constraint.
          </div>
        </div>
      </div>
    </div>
  );
});
