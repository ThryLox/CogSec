
export type ScenarioId = 
  | 'overworked_intern_eod' 
  | 'alert_fatigued_analyst' 
  | 'calm_morning_low_load' 
  | 'authority_dominant_context' 
  | 'multitasking_interruption_storm';

export interface EnvironmentContext {
  user_role: string;
  experience_level: string;
  time_of_day: string;
  baseline_workload: string;
  baseline_alert_rate: string;
}

export interface StimulusItem {
  id: string;
  sender_role: string;
  subject: string;
  urgency_flag: boolean;
  malicious: boolean;
}

export interface Telemetry {
  cognitive_state: any[];
  environment: any[];
  interaction: any[];
}

export interface ScenarioBundle {
  scenario_id: ScenarioId;
  title: string;
  description: string;
  theoretical_basis: string[];
  expected_risk_level: string;
  environment: EnvironmentContext;
  stimuli: StimulusItem[];
  telemetry: Telemetry;
}

export interface RiskSummary {
  level: string;
  failureMode: string;
  mechanism: string;
}

export interface AnalysisState {
  loading: boolean;
  result: string | null;
  error: string | null;
  summary: RiskSummary | null;
}

export interface Counterfactuals {
  reduceAlertDensity: boolean;
  removeUrgencyCues: boolean;
}
