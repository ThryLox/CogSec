
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Brain, ShieldAlert, Sparkles, RefreshCcw, Zap, Layout, 
  GraduationCap, Microscope, Fingerprint, Eye, Search, 
  Terminal, Activity, CheckCircle2, ChevronRight, AlertTriangle,
  ClipboardList, ExternalLink, SlidersHorizontal, Layers, X, Info
} from 'lucide-react';
import { SCENARIOS } from './constants';
import { ScenarioId, AnalysisState, Counterfactuals } from './types';
import { runCognitiveAnalysis } from './geminiService';
import ScenarioSelector from './components/ScenarioSelector';
import TelemetryDashboard from './components/TelemetryDashboard';

const App: React.FC = () => {
  const [selectedId, setSelectedId] = useState<ScenarioId>(SCENARIOS[0].scenario_id);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [counterfactuals, setCounterfactuals] = useState<Counterfactuals>({
    reduceAlertDensity: false,
    removeUrgencyCues: false,
  });
  const [analysis, setAnalysis] = useState<AnalysisState>({
    loading: false,
    result: null,
    error: null,
    summary: null,
  });
  const [highlightedLog, setHighlightedLog] = useState<string | null>(null);

  const activeScenario = useMemo(() => 
    SCENARIOS.find(s => s.scenario_id === selectedId) || SCENARIOS[0], 
    [selectedId]
  );

  const cognitiveLoad = useMemo(() => {
    const logs = activeScenario.telemetry.cognitive_state;
    if (!logs.length) return 0;
    const levelMap: Record<string, number> = { 'Low': 20, 'Medium': 50, 'High': 80, 'Very High': 95, 'Extreme': 100 };
    const values = logs.map(l => (levelMap[l.workload_level] || 50) + (l.time_pressure ? 10 : 0));
    return Math.min(100, Math.round(values.reduce((a, b) => a + b, 0) / values.length));
  }, [activeScenario]);

  const handleRunAnalysis = async () => {
    setAnalysis({ loading: true, result: null, error: null, summary: null });
    setHighlightedLog(null);
    if (window.innerWidth < 1024) setShowMobileSidebar(false);
    
    try {
      const { text, summary } = await runCognitiveAnalysis(activeScenario, counterfactuals);
      setAnalysis({ loading: false, result: text, summary, error: null });
    } catch (err) {
      setAnalysis({ loading: false, result: null, error: (err as Error).message, summary: null });
    }
  };

  const toggleCounterfactual = (key: keyof Counterfactuals) => {
    setCounterfactuals(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const scrollToLog = (id: string) => {
    setHighlightedLog(id);
    const el = document.getElementById(`log-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setHighlightedLog(null), 3000);
  };

  const renderAnalysisText = (text: string) => {
    return text.split(/(STAGE\s+\d+:|\[DESIGN-LEVEL\]|\[TRAINING-LEVEL\]|REASONING\s+LOGIC)/i).map((section, idx) => {
      const trimmed = section.trim();
      if (!trimmed) return null;

      const isStage = /STAGE\s+\d+:/i.test(trimmed);
      const isDesign = /\[DESIGN-LEVEL\]/i.test(trimmed);
      const isTraining = /\[TRAINING-LEVEL\]/i.test(trimmed);
      const isLogic = /REASONING\s+LOGIC/i.test(trimmed);

      if (isStage) {
        return (
          <div key={idx} className="mt-12 mb-6 flex items-center gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-mono text-blue-500 font-black">
              0{trimmed.match(/\d+/)?.[0]}
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">{trimmed}</h2>
              <div className="h-px w-full bg-gradient-to-r from-blue-500/30 to-transparent mt-1" />
            </div>
          </div>
        );
      }

      if (isDesign || isTraining) {
        return (
          <div key={idx} className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mb-1.5 mr-2 ${isDesign ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15_rgba(16,185,129,0.05)]'}`}>
            {isDesign ? <Layout className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
            {trimmed.replace(/[\[\]]/g, '')}
          </div>
        );
      }

      if (isLogic) {
        return (
          <div key={idx} className="mt-20 p-8 bg-blue-500/[0.02] border border-blue-500/10 rounded-[2.5rem] relative overflow-hidden group hover:border-blue-500/30 transition-colors">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Zap className="w-24 h-24 text-blue-500" /></div>
             <div className="flex items-center gap-3 mb-4">
                <Microscope className="w-5 h-5 text-blue-400" />
                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Inference Engine Observation</h3>
             </div>
             <p className="text-sm text-slate-500 italic leading-relaxed font-medium">{trimmed.replace(/REASONING\s+LOGIC/i, '').trim()}</p>
          </div>
        );
      }

      const paragraphs = trimmed.split('\n').filter(l => l.trim()).map((line, li) => {
        const parts = line.split(/(\[[CEI]-\d+\])/g);
        return (
          <p key={li} className="text-slate-400/90 leading-relaxed font-medium mb-5 last:mb-0 text-sm">
            {parts.map((part, pi) => {
              const match = part.match(/^\[([CEI]-\d+)\]$/);
              if (match) {
                const id = match[1];
                return (
                  <button 
                    key={pi}
                    onClick={() => scrollToLog(id)}
                    className="mx-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[9px] font-black hover:bg-blue-600 hover:text-white transition-all inline-flex items-center gap-1 align-middle shadow-sm"
                  >
                    <Eye className="w-3 h-3" /> {id}
                  </button>
                );
              }
              return part;
            })}
          </p>
        );
      });

      return <div key={idx} className="mb-8">{paragraphs}</div>;
    });
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-300 font-sans selection:bg-blue-500/20 overflow-x-hidden">
      {/* HUD Header */}
      <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-[100] px-8 flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
              <Brain className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-white">CTMA <span className="text-blue-500">Core</span></h1>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Neural Simulation v2.1.4_STABLE</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-6 pr-8 border-r border-white/5">
             <div className="text-right">
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">CTS Context</div>
                <div className="text-[11px] font-bold text-slate-300">{activeScenario.title}</div>
             </div>
             <div className="text-right">
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Cognitive Risk</div>
                <div className={`text-[11px] font-black uppercase ${activeScenario.expected_risk_level === 'High' ? 'text-red-500' : 'text-emerald-500'}`}>{activeScenario.expected_risk_level}</div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                title="Simulation Configuration" 
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className={`p-2.5 rounded-xl border transition-all ${showMobileSidebar ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800'}`}
             >
                <SlidersHorizontal className="w-4 h-4" />
             </button>
             <button 
                title="CTS Signal Layers"
                onClick={() => scrollToLog('C-0')}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 transition-colors text-slate-400"
             >
                <Layers className="w-4 h-4" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* SIDEBAR: Controls & Live Data */}
        <section className={`lg:col-span-4 space-y-8 lg:block ${showMobileSidebar ? 'block fixed inset-0 z-50 bg-[#020408] p-8 overflow-y-auto no-print' : 'hidden'} lg:relative lg:p-0 lg:bg-transparent lg:z-auto`}>
          
          {showMobileSidebar && (
            <div className="flex justify-end mb-6 lg:hidden">
              <button onClick={() => setShowMobileSidebar(false)} className="p-3 bg-slate-900 rounded-full border border-white/10">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          )}

          {/* CONTROL MODULE */}
          <div className="bg-[#080d17] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-8 ring-1 ring-white/5">
            <div className="flex items-center justify-between opacity-40">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">CTS Parameters</h2>
              <Terminal className="w-3.5 h-3.5" />
            </div>

            <ScenarioSelector selectedId={selectedId} onChange={setSelectedId} disabled={analysis.loading} />

            <div className="bg-black/30 border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Cognitive Stress</span>
                  <div className={`text-3xl font-black transition-colors duration-500 ${cognitiveLoad > 70 ? 'text-red-500' : 'text-blue-500'}`}>{cognitiveLoad}%</div>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Sandbox Integrity</span>
                  <div className="text-[11px] font-bold text-slate-300">99.8% STABLE</div>
                </div>
              </div>
              <div className="relative h-2 bg-slate-950 rounded-full overflow-hidden p-[1px] shadow-inner">
                <div className="absolute inset-0 opacity-10 flex justify-between px-4">
                   {[...Array(10)].map((_, i) => <div key={i} className="w-px h-full bg-white" />)}
                </div>
                <div 
                  className={`relative h-full rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${cognitiveLoad > 70 ? 'bg-gradient-to-r from-red-600 to-rose-400' : 'bg-gradient-to-r from-blue-600 to-indigo-400'}`} 
                  style={{ width: `${cognitiveLoad}%`, boxShadow: `0 0 20px -5px ${cognitiveLoad > 70 ? '#ef4444' : '#3b82f6'}` }} 
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Counterfactual Engine</span>
                 </div>
                 <div className="group relative">
                    <Info className="w-3 h-3 text-slate-600 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 border border-white/10 rounded-lg text-[8px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Toggles modify the AI's *reasoning assumptions* for the forensic analysis. They do not alter raw CTS telemetry.
                    </div>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {(Object.keys(counterfactuals) as Array<keyof Counterfactuals>).map(key => (
                  <button
                    key={key}
                    onClick={() => toggleCounterfactual(key)}
                    className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                      counterfactuals[key] 
                        ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/20' 
                        : 'bg-black/40 border-white/10 text-slate-500 hover:border-white/20'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className={`w-3.5 h-3.5 rounded-md border-2 transition-all flex items-center justify-center ${counterfactuals[key] ? 'bg-white border-white scale-110 shadow-lg' : 'border-slate-800'}`}>
                       {counterfactuals[key] && <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={analysis.loading}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-4 transition-all transform active:scale-[0.98] ${
                analysis.loading 
                  ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5' 
                  : 'bg-white text-black hover:bg-slate-200 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)]'
              }`}
            >
              {analysis.loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              {analysis.loading ? 'COMPILING REASONING' : 'EXECUTE FORENSIC ANALYSIS'}
            </button>
          </div>

          <TelemetryDashboard scenario={activeScenario} highlightedId={highlightedLog} />
        </section>

        {/* ANALYTICS PANEL */}
        <section className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 no-print">
            <div className="bg-[#080d17] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col justify-between h-44 relative group">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><ClipboardList className="w-12 h-12 text-blue-500" /></div>
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Failure Mechanism</span>
               <div className="text-xl font-black text-white leading-tight group-hover:text-blue-400 transition-colors">
                 {analysis.summary ? analysis.summary.failureMode : 'SIGNAL_AWAITING'}
               </div>
               <div className="text-[10px] text-blue-500 font-mono font-bold truncate">ID: {analysis.summary ? analysis.summary.mechanism : '---'}</div>
            </div>

            <div className="bg-[#080d17] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col justify-between h-44 relative group">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><AlertTriangle className="w-12 h-12 text-red-500" /></div>
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Inferred Severity</span>
               <div className={`text-5xl font-black transition-all ${analysis.summary?.level === 'High' ? 'text-red-500' : analysis.summary?.level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                 {analysis.summary ? analysis.summary.level : '00'}
               </div>
               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cognitive Threat Tier</div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/10 to-indigo-900/10 p-8 rounded-[2.5rem] border border-blue-500/10 shadow-2xl h-44 flex flex-col items-center justify-center text-center group">
               <Fingerprint className="w-10 h-10 text-blue-500/40 mb-3 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-500" />
               <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em]">CTS Evidence</span>
               <div className="mt-2 text-[9px] text-slate-600 font-bold uppercase tracking-widest">Forensic Tracing Active</div>
            </div>
          </div>

          <div className="min-h-[700px] bg-[#080d17] border border-white/10 rounded-[4rem] shadow-2xl relative overflow-hidden ring-1 ring-white/5">
            
            {!analysis.result && !analysis.loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-20 opacity-30 no-print">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-10 border border-white/10 shadow-inner">
                  <Search className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-[0.5em] text-white">System Idle</h3>
                <p className="max-w-md text-sm font-medium text-slate-500 mt-6 leading-relaxed">
                  The forensic reasoning pipeline is currently inactive. Select a cognitive signal source from the matrix and initialize analysis.
                </p>
              </div>
            )}

            {analysis.loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-10 p-20 text-center no-print">
                <div className="relative mb-12">
                  <div className="w-24 h-24 border-2 border-blue-500/10 rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-blue-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 m-auto w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 animate-pulse">
                     <Brain className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-[1em] text-blue-500 animate-pulse">Reasoning Pipeline Active</h3>
                  <div className="flex justify-center gap-1.5">
                     {[...Array(5)].map((_, i) => (
                       <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-900 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                     ))}
                  </div>
                </div>
              </div>
            )}

            {analysis.result && (
              <div className="p-8 md:p-16 lg:p-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20 border-b border-white/5 pb-16 relative report-header">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none no-print" />
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3 no-print">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">CTS Inference Artifact</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">{activeScenario.title}</h2>
                  </div>
                  <div className="font-mono text-[10px] text-slate-600 space-y-1 md:text-right">
                    <div>DATA_STREAM: {activeScenario.scenario_id.toUpperCase()}</div>
                    <div>TIMESTAMP: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
                
                <article className="max-w-4xl mx-auto report-narrative">
                  {renderAnalysisText(analysis.result)}
                </article>

                <div className="mt-24 pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-10 opacity-30 hover:opacity-100 transition-opacity no-print">
                   <button 
                    onClick={() => window.print()}
                    className="group text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-[0.3em] flex items-center gap-3 transition-all"
                   >
                     <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /> 
                     GENERATE PDF EVIDENCE
                   </button>
                   <div className="flex items-center gap-4 text-[9px] font-black text-slate-800 uppercase tracking-[0.6em]">
                      <div className="w-px h-6 bg-white/5" />
                      COGNITIVE FORENSICS LABORATORY
                   </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 bg-black/60 mt-20 no-print">
        <div className="max-w-7xl mx-auto px-10 text-center space-y-8">
           <div className="flex justify-center gap-6 opacity-10">
              {[...Array(6)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />)}
           </div>
           <p className="text-[10px] font-black text-slate-800 uppercase tracking-[1.2em]">CTMA // Neural Intelligence Platform // CTS Reasoning Architecture</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
