
import React, { useMemo } from 'react';
import { ScenarioBundle } from '../types';
import { Activity, Clock, MousePointer2, AlertCircle, Zap, Cpu } from 'lucide-react';

interface Props {
  scenario: ScenarioBundle;
  highlightedId?: string | null;
}

const TelemetryDashboard: React.FC<Props> = ({ scenario, highlightedId }) => {
  const timeline = useMemo(() => {
    const all = [
      ...scenario.telemetry.cognitive_state.map((t, i) => ({ ...t, stream: 'C', id: `C-${i}` })),
      ...scenario.telemetry.environment.map((t, i) => ({ ...t, stream: 'E', id: `E-${i}` })),
      ...scenario.telemetry.interaction.map((t, i) => ({ ...t, stream: 'I', id: `I-${i}` }))
    ];
    return all.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [scenario]);

  return (
    <div className="bg-[#0a0f1a] rounded-[2rem] overflow-hidden border border-white/5 shadow-xl relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Cpu className="w-12 h-12 text-blue-500" />
      </div>
      
      <div className="bg-white/[0.02] px-6 py-4 border-b border-white/5 flex items-center justify-between relative z-10">
        <div className="space-y-0.5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            CTS Neural Timeline
          </h3>
          <div className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Cognitive Telemetry Sandbox Engine</div>
        </div>
        <div className="flex gap-3 text-[8px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-amber-500"><div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"/> COG</span>
          <span className="flex items-center gap-1.5 text-blue-500"><div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"/> SYS</span>
          <span className="flex items-center gap-1.5 text-emerald-500"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"/> USR</span>
        </div>
      </div>

      <div className="p-4 max-h-[450px] overflow-y-auto space-y-2 custom-scrollbar scroll-smooth relative z-10">
        {timeline.map((event) => {
          const isHighlighted = highlightedId === event.id;
          const isHighPressure = event.time_pressure || event.severity === 'high_urgency' || event.warning_ignored;
          
          const colorClass = event.stream === 'C' ? 'border-amber-500/20' : event.stream === 'E' ? 'border-blue-500/20' : 'border-emerald-500/20';
          const bgClass = event.stream === 'C' ? 'bg-amber-500/[0.03]' : event.stream === 'E' ? 'bg-blue-500/[0.03]' : 'bg-emerald-500/[0.03]';
          const icon = event.stream === 'C' ? <Activity className="w-3 h-3 text-amber-500" /> : event.stream === 'E' ? <AlertCircle className="w-3 h-3 text-blue-500" /> : <MousePointer2 className="w-3 h-3 text-emerald-500" />;

          return (
            <div 
              key={event.id}
              id={`log-${event.id}`}
              className={`group flex items-start gap-4 p-3 rounded-xl border transition-all duration-500 relative overflow-hidden ${isHighlighted ? 'ring-2 ring-blue-500 bg-blue-500/20 scale-[1.02] border-blue-500 z-10' : `${colorClass} ${bgClass} hover:border-white/20`}`}
            >
              {isHighPressure && (
                <div className="absolute top-0 right-0 p-1">
                  <Zap className="w-2 h-2 text-red-500 animate-pulse" />
                </div>
              )}
              <div className="flex-shrink-0 mt-1 opacity-70 group-hover:opacity-100 transition-opacity">{icon}</div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono text-slate-600 font-bold tracking-tighter">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-[8px] font-black text-slate-800 uppercase">CTS-{event.id}</span>
                </div>
                <div className="text-[11px] text-slate-300 font-bold uppercase tracking-tight">
                  {event.event_type || event.workload_level || 'Sandbox Frame'}
                </div>
                <div className="mt-1 text-[9px] text-slate-600 font-mono line-clamp-1 group-hover:line-clamp-none transition-all">
                  {JSON.stringify(event.data || event).replace(/[{}"]/g, '').replace(/,/g, ' | ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="px-6 py-3 border-t border-white/5 bg-black/20 text-[8px] font-black text-slate-700 uppercase tracking-widest flex justify-between items-center">
         <span>Ground Truth Synchronization: Active</span>
         <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-blue-500" /> CTS-REV 1.0.4</span>
      </div>
    </div>
  );
};

export default TelemetryDashboard;
