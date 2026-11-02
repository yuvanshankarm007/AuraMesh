import React from 'react';
import { ClimateContext } from '../agent-core/types';
import { DEMO_CLIMATES } from '../data/demoSeed';
import { Sun, CloudRain, Wind, Snowflake, ShieldAlert, Thermometer, Droplets, Gauge } from 'lucide-react';

interface EnvironmentBarProps {
  currentClimate?: ClimateContext;
  onSelectClimate: (climate: ClimateContext) => void;
}

const EnvironmentClimateBarComponent: React.FC<EnvironmentBarProps> = ({
  currentClimate = DEMO_CLIMATES[0],
  onSelectClimate
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'climate_desert_arid':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'climate_monsoon_humid':
        return <CloudRain className="w-3.5 h-3.5 text-cyan-400" />;
      case 'climate_urban_smog':
        return <Wind className="w-3.5 h-3.5 text-purple-400" />;
      case 'climate_polar_dry':
        return <Snowflake className="w-3.5 h-3.5 text-blue-300" />;
      default:
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getStressBadge = (stress: string) => {
    switch (stress) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'moderate':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Title & Active Environment */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 shrink-0">
            {getIcon(currentClimate.id)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-200">
                Geospatial & Climate Skin Telemetry
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStressBadge(currentClimate.stressLevel)}`}>
                {currentClimate.stressLevel} Environmental Stress
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              <strong>{currentClimate.name}</strong> • {currentClimate.description}
            </p>
          </div>
        </div>

        {/* Live Weather Metrics */}
        <div className="flex items-center space-x-2 text-xs overflow-x-auto pb-1 md:pb-0">
          <div className="bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shrink-0">
            <Sun className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400 text-[10px]">UV Index:</span>
            <span className={`font-mono font-bold text-[11px] ${currentClimate.uvIndex >= 8 ? 'text-rose-400' : 'text-amber-300'}`}>
              {currentClimate.uvIndex} {currentClimate.uvIndex >= 11 ? '(Extreme)' : currentClimate.uvIndex >= 7 ? '(Very High)' : '(Moderate)'}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shrink-0">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400 text-[10px]">Humidity:</span>
            <span className="font-mono font-bold text-[11px] text-cyan-300">
              {currentClimate.humidity}%
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shrink-0">
            <Gauge className="w-3 h-3 text-purple-400" />
            <span className="text-slate-400 text-[10px]">AQI (PM2.5):</span>
            <span className={`font-mono font-bold text-[11px] ${currentClimate.aqi > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {currentClimate.aqi}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shrink-0">
            <Thermometer className="w-3 h-3 text-rose-400" />
            <span className="text-slate-400 text-[10px]">Temp:</span>
            <span className="font-mono font-bold text-[11px] text-slate-200">
              {currentClimate.temperatureC}°C
            </span>
          </div>
        </div>
      </div>

      {/* Climate Presets Selector */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-pink-400" /> Live Climate Invariant Trigger:
        </span>

        <div className="flex space-x-1.5 overflow-x-auto">
          {DEMO_CLIMATES.map((climate) => {
            const isSelected = climate.id === currentClimate.id;
            return (
              <button
                key={climate.id}
                onClick={() => onSelectClimate(climate)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500/20 to-cyan-500/20 text-slate-100 border-pink-500/50 shadow-sm shadow-pink-500/10'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {getIcon(climate.id)}
                <span>{climate.city}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const EnvironmentClimateBar = React.memo(EnvironmentClimateBarComponent);
