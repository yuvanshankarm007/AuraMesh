import React, { useState } from 'react';
import { SkinDiagnosticScores } from '../agent-core/types';
import { Clock, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';

interface ChronoSkinProps {
  scores?: SkinDiagnosticScores;
  avatarUrl?: string;
}

export const ChronoSkinProgress: React.FC<ChronoSkinProps> = React.memo(({ scores, avatarUrl }) => {
  const [selectedDay, setSelectedDay] = useState<1 | 14 | 30>(14);

  if (!scores) return null;

  // Calculate projected clinical delta based on time
  const getProjectedScores = (day: 1 | 14 | 30) => {
    if (day === 1) {
      return {
        acne: scores.acne,
        redness: scores.redness,
        texture: scores.texture,
        pores: scores.pores,
        skinAge: scores.skinAge,
        barrierHealth: scores.barrierHealth
      };
    }
    if (day === 14) {
      return {
        acne: Math.min(100, Math.round(scores.acne + (100 - scores.acne) * 0.45)),
        redness: Math.min(100, Math.round(scores.redness + (100 - scores.redness) * 0.50)),
        texture: Math.min(100, Math.round(scores.texture + (100 - scores.texture) * 0.40)),
        pores: Math.min(100, Math.round(scores.pores + (100 - scores.pores) * 0.35)),
        skinAge: Math.max(18, scores.skinAge - 1),
        // Preserve intact barrier if already intact; step up severely compromised to sensitized
        barrierHealth: scores.barrierHealth === 'severely_compromised' ? 'sensitized' : scores.barrierHealth
      };
    }
    // Day 30
    return {
      acne: Math.min(100, Math.round(scores.acne + (100 - scores.acne) * 0.82)),
      redness: Math.min(100, Math.round(scores.redness + (100 - scores.redness) * 0.85)),
      texture: Math.min(100, Math.round(scores.texture + (100 - scores.texture) * 0.78)),
      pores: Math.min(100, Math.round(scores.pores + (100 - scores.pores) * 0.70)),
      skinAge: Math.max(18, scores.skinAge - 3),
      barrierHealth: 'intact'
    };
  };

  const projected = getProjectedScores(selectedDay);

  const milestones = [
    {
      day: 7,
      title: 'TEWL Barrier Stabilization',
      desc: 'Multi-ceramides NP/AP lock moisture lamellae, decreasing stinging by 78%.',
      activeOn: selectedDay >= 14
    },
    {
      day: 14,
      title: 'C. Acnes Follicular Suppression',
      desc: 'Azelaic Acid 10% & Zinc PCA reduce inflammatory papules and sebum output by 40%.',
      activeOn: selectedDay >= 14
    },
    {
      day: 30,
      title: 'Cellular Stratum Corneum Renewal',
      desc: 'Epidermal turnover cycle completes; post-inflammatory erythema spots fade.',
      activeOn: selectedDay >= 30
    }
  ];

  return (
    <div className="space-y-4">
      {/* Day Selector Buttons */}
      <div className="flex items-center justify-between bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
        <span className="text-xs font-semibold text-slate-400 pl-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-pink-400" />
          Clinical Timeline:
        </span>
        <div className="flex space-x-1.5">
          {([1, 14, 30] as const).map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedDay === d
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Day {d} {d === 1 ? '(Baseline)' : d === 30 ? '(Complete)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Before vs After Visualizer */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-4 relative aspect-square rounded-xl overflow-hidden border border-slate-700">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Subject"
              className={`w-full h-full object-cover transition-all duration-700 ${
                selectedDay === 30 ? 'filter contrast-105 brightness-105 saturate-105' : ''
              }`}
            />
          ) : null}

          {/* Simulated Clearing Filter */}
          {selectedDay > 1 ? (
            <div
              className={`absolute inset-0 pointer-events-none transition-all duration-700 ${
                selectedDay === 14 ? 'backdrop-blur-[0.5px] bg-emerald-500/5' : 'backdrop-blur-[1px] bg-pink-500/10'
              }`}
            />
          ) : null}

          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-sm rounded-lg p-1.5 border border-slate-800 text-center">
            <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Day {selectedDay} Projection • Age: {projected.skinAge} yrs
            </span>
          </div>
        </div>

        {/* Delta Scores */}
        <div className="sm:col-span-8 space-y-2.5">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300 font-medium">Acne Clearance Index</span>
              <span className="font-mono text-emerald-400 font-bold">
                {projected.acne}/100 {selectedDay > 1 ? `(+${projected.acne - scores.acne} pts)` : ''}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-500 rounded-full"
                style={{ width: `${projected.acne}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300 font-medium">Erythema (Redness) Resolution</span>
              <span className="font-mono text-emerald-400 font-bold">
                {projected.redness}/100 {selectedDay > 1 ? `(+${projected.redness - scores.redness} pts)` : ''}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500 rounded-full"
                style={{ width: `${projected.redness}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300 font-medium">Surface Smoothness & Pores</span>
              <span className="font-mono text-emerald-400 font-bold">
                {projected.texture}/100 {selectedDay > 1 ? `(+${projected.texture - scores.texture} pts)` : ''}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${projected.texture}%` }}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Projected Barrier Status:</span>
            <span className="font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {projected.barrierHealth}
            </span>
          </div>
        </div>
      </div>

      {/* Clinical Milestones */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
        <h5 className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-pink-400" />
          Clinical Milestones Unlocked
        </h5>
        <div className="space-y-1.5">
          {milestones.map((m) => (
            <div
              key={m.day}
              className={`p-2 rounded-lg border text-[11px] transition-all flex items-start space-x-2 ${
                m.activeOn
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
              }`}
            >
              <CheckCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${m.activeOn ? 'text-emerald-400' : 'text-slate-600'}`} />
              <div>
                <strong className={m.activeOn ? 'text-emerald-300' : 'text-slate-400'}>
                  Day {m.day}: {m.title}
                </strong>
                <p className="text-[10px] mt-0.5 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
