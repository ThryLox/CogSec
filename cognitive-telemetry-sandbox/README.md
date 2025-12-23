# Cognitive Telemetry Sandbox (CTS)

## Overview
The Cognitive Telemetry Sandbox is a simulation environment designed to study cognitive pressure and security decision-making using synthetic telemetry. It models various "cognitive scenarios" (e.g., an overworked intern, an alert-fatigued analyst) to generate datasets that combine environmental stimuli, cognitive state snapshots, and user interaction logs.

## Dataset Scope & Ethics Statement
> **This sandbox uses synthetic, scenario-driven telemetry to model cognitive pressure in security decision-making. No real user data is collected, stored, or inferred.**

## Project Structure
The sandbox is organized into scenarios, each representing a specific cognitive condition.
```
cognitive-telemetry-sandbox/
├── README.md               # This file
├── schema/                 # JSON Schemas for validation
├── scenarios/
│   ├── overworked_intern_eod/
│   ├── alert_fatigued_analyst/
│   ├── authority_dominant_context/
│   ├── calm_morning_low_load/
│   └── multitasking_interruption_storm/
```

## Scenario Structure
Each scenario folder contains:
- `scenario.json`: Metadata about the cognitive risk.
- `environment.json`: Baseline context (role, workload).
- `inbox.json` OR `alerts.json`: The "stimuli" injected into the session.
- `telemetry/`:
    - `environment.log.json`: Log of system events (emails arriving, alerts).
    - `cognitive_state.log.json`: Snapshots of the user's simulated mental state.
    - `interaction.log.json`: Log of user actions (clicks, dismissals).
- `README.md`: Narrative description of the scenario.

## Usage
This dataset is intended to be consumed by AI systems (like Gemini) to reason about **cognitive vulnerability** rather than just content classification. By analyzing the *telemetry* (how the user reacted) alongside the *context* (workload, time of day), the system can infer *why* a security failure occurred.
