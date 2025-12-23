
import React, { useState } from 'react';
import { ScenarioBundle } from '../types';
import { Clock, Terminal, Activity, Monitor, Fingerprint } from 'lucide-react';

interface Props {
  scenario: ScenarioBundle;
}

const TelemetryPanel: React.FC<Props> = ({ scenario }) => {
  const [activeTab, setActiveTab] = useState<'cognitive' | 'environment' | 'interaction'>('interaction');

  const getLogs = () => {
    switch(activeTab) {
      case 'cognitive': return scenario.telemetry.cognitive_state;
      case 'environment': return scenario.telemetry.environment;
      case 'interaction': return scenario.telemetry.interaction;
    }
  };

  const getIcon = () => {
    switch(activeTab) {
      case 'cognitive': return <Activity className="w-4 h-4" />;
      case 'environment': return <Monitor className="w-4 h-4" />;
      case 'interaction': return <Fingerprint className="w-4 h-4" />;
    }
  };

  return (
    <div className="glass rounded-xl p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-lg">Sandbox Telemetry</h3>
        </div>
        <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-800">
          {(['interaction', 'environment', 'cognitive'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-3 font-mono text-xs max-h-72 overflow-y-auto pr-2 custom-scrollbar">
        {getLogs().map((t, idx) => (
          <div key={idx} className="border-l-2 border-slate-700 pl-3 py-1 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(t.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <span className="flex items-center gap-1 opacity-60">
                {getIcon()}
              </span>
            </div>
            <div className="text-slate-200">
              {t.event_type || t.description || (activeTab === 'cognitive' ? `Load: ${t.workload_level}` : 'Telemetry Event')}
            </div>
            <div className="mt-1 text-[10px] text-slate-500 bg-slate-900/40 p-1.5 rounded break-all">
              {Object.entries(t).filter(([k]) => k !== 'timestamp' && k !== 'event_type').map(([k, v]) => (
                <span key={k} className="mr-2">
                  <span className="text-slate-600">{k}:</span> {JSON.stringify(v)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TelemetryPanel;
