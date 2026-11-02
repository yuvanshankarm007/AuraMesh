import React, { useState } from 'react';
import { ActiveInteraction, WhatIfSwapOption } from '../agent-core/types';
import { ACTIVE_INTERACTIONS_MATRIX, WHAT_IF_SWAP_OPTIONS } from '../data/demoSeed';
import { Beaker, Sparkles, AlertTriangle, ShieldCheck, ArrowRightLeft, Check, Flame } from 'lucide-react';

interface WhatIfMatrixProps {
  activeSwaps?: WhatIfSwapOption[];
  onTriggerSwap: (swapId: string) => void;
  synergyScore?: number;
}

const WhatIfMatrixDrawerComponent: React.FC<WhatIfMatrixProps> = ({
  activeSwaps = WHAT_IF_SWAP_OPTIONS,
  onTriggerSwap,
  synergyScore = 92
}) => {
  const [activeTab, setActiveTab] = useState<'swaps' | 'matrix'>('swaps');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm mt-4">
      {/* Header & Tab Selector */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Beaker className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-slate-200">
            Interactive What-If Active Sandbox & Synergy Matrix
          </h4>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('swaps')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === 'swaps'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              What-If Actives Sandbox
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === 'matrix'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pharmacological Matrix
            </button>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg text-[11px] text-emerald-300 font-mono font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{synergyScore}% Synergy</span>
          </div>
        </div>
      </div>

      {activeTab === 'swaps' ? (
        <div className="space-y-2.5">
          <p className="text-[11px] text-slate-400">
            Test real-time multi-agent negotiation: Toggle active ingredients to watch the Formulation and Commerce Specialists negotiate price, barrier safety, and contraindications.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {activeSwaps.map((swap) => {
              const isApplied = !!swap.applied;
              return (
                <div
                  key={swap.id}
                  className={`rounded-xl p-3 border text-xs transition-all flex flex-col justify-between ${
                    isApplied
                      ? 'bg-emerald-950/30 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-400 font-mono text-[10px]">What-If Swap</span>
                      <span className={`font-mono font-bold ${swap.costDelta < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {swap.costDelta < 0 ? `Save $${Math.abs(swap.costDelta).toFixed(2)}` : 'Cost Neutral'}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5 my-1">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="line-clamp-1">{swap.targetActive}</span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed mb-2 line-clamp-2">
                      {swap.swapRationale}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-cyan-300 font-mono flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                      {swap.barrierSafetyScore}/100 Safety
                    </span>

                    <button
                      onClick={() => onTriggerSwap(swap.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1 ${
                        isApplied
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-pink-600 hover:text-white hover:border-pink-500'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <span>Simulate Swap</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
          {ACTIVE_INTERACTIONS_MATRIX.map((item, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl border text-[11px] flex items-start justify-between gap-2 ${
                item.type === 'CONFLICT'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : item.type === 'PHOTO_SENSITIZING'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                {item.type === 'CONFLICT' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                ) : item.type === 'PHOTO_SENSITIZING' ? (
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>{item.ingredientA}</span>
                    <span className="text-slate-400 font-normal">+</span>
                    <span>{item.ingredientB}</span>
                  </div>
                  <p className="text-[10px] opacity-90 mt-0.5 leading-relaxed">
                    {item.clinicalDescription}
                  </p>
                </div>
              </div>

              <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border bg-slate-950/60 shrink-0">
                {item.actionTaken.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const WhatIfMatrixDrawer = React.memo(WhatIfMatrixDrawerComponent);
