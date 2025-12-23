
import React, { useState, useRef, useEffect } from 'react';
import { SCENARIOS } from '../constants';
import { ScenarioId } from '../types';
import { ChevronDown, Activity, ShieldQuestion, User, Radio, Target, AlertTriangle } from 'lucide-react';

interface Props {
  selectedId: ScenarioId;
  onChange: (id: ScenarioId) => void;
  disabled?: boolean;
}

const ScenarioSelector: React.FC<Props> = ({ selectedId, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeScenario = SCENARIOS.find(s => s.scenario_id === selectedId) || SCENARIOS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: ScenarioId) => {
    if (disabled) return;
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Target className="w-3 h-3 text-blue-500" />
          Signal Selection
        </label>
        {isOpen && (
           <span className="text-[8px] font-black text-blue-500 animate-pulse uppercase tracking-widest">Awaiting Input...</span>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
            isOpen 
              ? 'bg-blue-600/10 border-blue-500/50 ring-4 ring-blue-500/5 shadow-2xl' 
              : 'bg-black/40 border-white/10 hover:border-white/20'
          } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className={`p-2 rounded-xl transition-all duration-500 ${
              isOpen ? 'bg-blue-500 text-white rotate-12 scale-110' : 'bg-slate-800 text-slate-400'
            }`}>
              {activeScenario.expected_risk_level === 'High' ? <ShieldQuestion className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="text-left min-w-0">
              <div className="text-[11px] font-black text-white uppercase tracking-wider truncate">
                {activeScenario.title}
              </div>
              <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                Current Matrix: {activeScenario.scenario_id.split('_')[0]}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-500 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
          
          {/* Subtle activity glow */}
          {!isOpen && <div className="absolute right-12 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-blue-500 animate-ping opacity-20" />}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 z-[200] bg-[#0a0f1a] border border-white/10 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-3 animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-3xl">
            <div className="max-h-[320px] overflow-y-auto custom-scrollbar space-y-1.5 p-1">
              {SCENARIOS.map((s) => {
                const isActive = selectedId === s.scenario_id;
                const isHighRisk = s.expected_risk_level === 'High';

                return (
                  <button
                    key={s.scenario_id}
                    onClick={() => handleSelect(s.scenario_id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-start gap-4 group/item ${
                      isActive 
                        ? 'bg-blue-600/20 border border-blue-500/30' 
                        : 'hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <div className={`mt-1 p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-600 group-hover/item:text-slate-400'
                    }`}>
                      {isHighRisk ? <AlertTriangle className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-400'}`}>
                          {s.title}
                        </span>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />}
                      </div>
                      <p className="text-[9px] text-slate-600 mt-1 line-clamp-1 group-hover/item:text-slate-500 transition-colors">
                        {s.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-3 pt-3 border-t border-white/5 px-4 pb-2 flex items-center justify-between opacity-40">
               <span className="text-[8px] font-black uppercase tracking-[0.3em]">Neural Catalog</span>
               <span className="text-[8px] font-mono">{SCENARIOS.length} Sources Available</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioSelector;
