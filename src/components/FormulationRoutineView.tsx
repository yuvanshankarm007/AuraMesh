import React from 'react';
import { FormulationPlan } from '../agent-core/types';
import { Beaker, Sun, Moon, AlertCircle } from 'lucide-react';

interface RoutineProps {
  formulation?: FormulationPlan;
}

const FormulationRoutineViewComponent: React.FC<RoutineProps> = ({ formulation }) => {
  if (!formulation) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center h-[340px] text-slate-500 text-xs">
        <Beaker className="w-8 h-8 mb-2 opacity-30 text-emerald-400" />
        <p>Awaiting Pharmacological Formulation Synthesis...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <Beaker className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Formulation Specialist: Prescribed Clinical Regimen
          </h3>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          {formulation.barrierProtocol}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Morning Routine */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 border-b border-slate-800 pb-2">
            <Sun className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">AM: Defense & Sebum Balance</h4>
          </div>
          <div className="space-y-2.5">
            {formulation.morningRoutine.map((ing) => (
              <div key={ing.id} className="text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>{ing.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {ing.concentration}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {ing.scientificRationale}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Evening Routine */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-2">
            <Moon className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">PM: Cellular Repair & Redness Relief</h4>
          </div>
          <div className="space-y-2.5">
            {formulation.eveningRoutine.map((ing) => (
              <div key={ing.id} className="text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>{ing.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {ing.concentration}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {ing.scientificRationale}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contraindications Warning */}
      <div className="mt-3 bg-rose-500/5 border border-rose-500/20 rounded-xl p-2.5 flex items-start space-x-2 text-[11px] text-rose-300">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong>Contraindications Filtered Out by Formulation Agent:</strong>{' '}
          {formulation.contraindicationsAvoided.join(', ')} (preventing barrier destruction).
        </div>
      </div>
    </div>
  );
};

export const FormulationRoutineView = React.memo(FormulationRoutineViewComponent);
