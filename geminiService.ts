
import { GoogleGenAI } from '@google/genai';
import { ScenarioBundle, Counterfactuals, RiskSummary } from './types';

export const runCognitiveAnalysis = async (
  scenario: ScenarioBundle,
  counterfactuals: Counterfactuals
): Promise<{ text: string; summary: RiskSummary }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const envData = JSON.stringify(scenario.environment);
  const stimuliData = JSON.stringify(scenario.stimuli);
  const cognitiveLogs = JSON.stringify(scenario.telemetry.cognitive_state);
  const envLogs = JSON.stringify(scenario.telemetry.environment);
  const interactionLogs = JSON.stringify(scenario.telemetry.interaction);

  const counterfactualContext = `
    [ENGINE OVERRIDE: ACTIVE COUNTERFACTUALS]
    - REDUCE ALERT DENSITY: ${counterfactuals.reduceAlertDensity ? 'ENABLED (Assume 70% fewer non-critical interruptions occurred)' : 'DISABLED'}
    - REMOVE URGENCY CUES: ${counterfactuals.removeUrgencyCues ? 'ENABLED (Assume all "High Urgency" flags and time-pressure language were neutralized)' : 'DISABLED'}
  `;

  // Fix: Escaped triple backticks to prevent premature termination of the template literal.
  // This resolves the errors like "Cannot find name 'Conclude'" and "'with' statements are not allowed".
  const prompt = `
    You are the "Cognitive Threat Modeling Assistant (CTMA)".
    Your task is to provide a high-fidelity forensic cognitive analysis.

    [SIMULATION DATA]
    Scenario: ${scenario.title}
    Context: ${envData}
    Stimuli: ${stimuliData}
    Telemetry Logs:
    - Cognitive State: ${cognitiveLogs}
    - Environment Events: ${envLogs}
    - Interaction Events: ${interactionLogs}

    [COUNTERFACTUAL CONTEXT]
    ${counterfactualContext}

    [OUTPUT SCHEMA]
    You MUST provide exactly two sections separated by "===REPORT_START===".

    SECTION 1: JSON METADATA
    Return ONLY a raw JSON object: {"level": "Low/Medium/High", "failureMode": "Mode Title", "mechanism": "Core Mechanism"}
    Note: If counterfactuals are enabled, this metadata should reflect the *modified* risk state.

    ===REPORT_START===

    SECTION 2: NARRATIVE ANALYSIS
    STRICTLY use these exact stage titles:
    STAGE 1: COGNITIVE RECONSTRUCTION
    STAGE 2: COGNITIVE VULNERABILITY INFERENCE
    STAGE 3: COUNTERFACTUAL REASONING
    STAGE 4: HUMAN-CENTERED SECURITY MITIGATIONS

    [INSTRUCTION FOR STAGE 3]
    If counterfactuals are ENABLED in the context above, explicitly reason about how the user's decision latency and accuracy would have shifted. 
    If they are DISABLED, explain what the baseline risk was and why it remained high.

    [MANDATORY CONSTRAINTS]
    - In STAGE 2, cite evidence using tokens like [C-0], [E-1], or [I-0].
    - In STAGE 4, prefix EVERY recommendation with either [DESIGN-LEVEL] or [TRAINING-LEVEL].
    - NO markdown bold (**), NO italics (_), NO headers (#). Use plain text and uppercase for titles.
    - NO code blocks (\`\`\`).
    - Conclude with a section titled "REASONING LOGIC" explaining Gemini's role.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.1,
        topP: 1.0,
      }
    });

    const fullText = response.text || "";
    let summary: RiskSummary = { level: scenario.expected_risk_level, failureMode: "Analyzing...", mechanism: "Analyzing..." };
    let narrative = "";

    const parts = fullText.split('===REPORT_START===');
    if (parts.length >= 2) {
      // Fix: Escaped backticks in regex to avoid confusing the parser and potential runtime errors.
      const jsonPart = parts[0].trim().replace(/\`{3}json|\`{3}/g, '');
      narrative = parts.slice(1).join('').trim();
      try {
        summary = JSON.parse(jsonPart.match(/\{[\s\S]*?\}/)?.[0] || jsonPart);
      } catch (e) {
        console.warn("JSON Extraction Failed", e);
      }
    } else {
      narrative = fullText.replace(/\{[\s\S]*?\}/, '').trim();
    }

    // Fix: Escaped backticks in the string cleaning regexes.
    const cleanedText = narrative
      .replace(/\`{3}[a-z]*\n?/g, '')
      .replace(/\`{3}/g, '')
      .replace(/\*\*/g, '')
      .replace(/^#+\s/gm, '')
      .replace(/_/g, '')
      .trim();

    return { text: cleanedText, summary };
  } catch (error: any) {
    throw new Error(`ANALYSIS_PIPELINE_ERROR: ${error?.message || "Internal reasoning failure."}`);
  }
};
