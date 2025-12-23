
import { ScenarioBundle } from './types';

export const SCENARIOS: ScenarioBundle[] = [
  {
    scenario_id: 'overworked_intern_eod',
    title: "Overworked Intern at End of Day",
    description: "A junior intern rushing to finish tasks at 5:30 PM faces high cognitive load, time pressure, and a mix of benign and malicious urgent requests.",
    theoretical_basis: [
      "Vigilance Decrement",
      "Time Pressure (Speed-Accuracy Trade-off)",
      "Authority Bias"
    ],
    expected_risk_level: "High",
    environment: {
      user_role: "Security Intern",
      experience_level: "Junior",
      time_of_day: "17:30",
      baseline_workload: "High",
      baseline_alert_rate: "Medium"
    },
    stimuli: [
      { id: "email_001", sender_role: "HR Manager", subject: "REMINDER: Timesheet Submission Due by 6 PM", urgency_flag: true, malicious: false },
      { id: "email_002", sender_role: "Team Lead", subject: "Slides for tomorrow's standup?", urgency_flag: false, malicious: false },
      { id: "email_003", sender_role: "IT Success Team", subject: "Urgent: VPN Policy Update - Action Required Immediately", urgency_flag: true, malicious: true },
      { id: "email_004", sender_role: "Colleague", subject: "Lunch tomorrow?", urgency_flag: false, malicious: false },
      { id: "email_005", sender_role: "Director of Engineering", subject: "Quick question about the logs", urgency_flag: true, malicious: false }
    ],
    telemetry: {
      cognitive_state: [
        { timestamp: "2024-10-24T17:30:00Z", workload_level: "High", pending_tasks: 5, alerts_last_10_min: 2, time_pressure: true },
        { timestamp: "2024-10-24T17:30:25Z", workload_level: "Very High", pending_tasks: 6, alerts_last_10_min: 4, time_pressure: true }
      ],
      environment: [
        { timestamp: "2024-10-24T17:30:00Z", event_type: "baseline_check", severity: "info", timed_during_task: false, visual_similarity_to_previous: false },
        { timestamp: "2024-10-24T17:30:05Z", event_type: "email_arrival", target_id: "email_001", severity: "normal", timed_during_task: false, visual_similarity_to_previous: false },
        { timestamp: "2024-10-24T17:30:20Z", event_type: "email_arrival", target_id: "email_003", severity: "high_urgency", timed_during_task: true, visual_similarity_to_previous: true }
      ],
      interaction: [
        { timestamp: "2024-10-24T17:30:10Z", event_type: "email_opened", target_id: "email_001", decision_latency_seconds: 5, warning_displayed: false, warning_ignored: false },
        { timestamp: "2024-10-24T17:30:25Z", event_type: "email_opened", target_id: "email_003", decision_latency_seconds: 2, warning_displayed: true, warning_ignored: true },
        { timestamp: "2024-10-24T17:30:28Z", event_type: "link_clicked", target_id: "email_003", decision_latency_seconds: 3, warning_displayed: false, warning_ignored: false }
      ]
    }
  },
  {
    scenario_id: 'alert_fatigued_analyst',
    title: "Alert Fatigued SOC Analyst",
    description: "A senior SOC analyst on a night shift faces a high volume of low-fidelity alerts, leading to desensitization and missed critical signals.",
    theoretical_basis: [
      "Habituation (Desensitization)",
      "Vigilance Decrement",
      "Automation Bias"
    ],
    expected_risk_level: "High",
    environment: {
      user_role: "SOC Analyst",
      experience_level: "Senior",
      time_of_day: "02:00",
      baseline_workload: "Monotonous",
      baseline_alert_rate: "Very High"
    },
    stimuli: [
      { id: "alert_001", sender_role: "IDS System", subject: "Port Scan Detected (Internal)", urgency_flag: false, malicious: false },
      { id: "alert_002", sender_role: "WAF", subject: "SQL Injection Attempt Blocked", urgency_flag: false, malicious: false },
      { id: "alert_003", sender_role: "Endpoint Protection", subject: "Suspicious PowerShell execution (mimikatz signature)", urgency_flag: true, malicious: true },
      { id: "alert_004", sender_role: "IDS System", subject: "Port Scan Detected (External)", urgency_flag: false, malicious: false },
      { id: "alert_005", sender_role: "Firewall", subject: "Deny Traffic: 192.168.1.55", urgency_flag: false, malicious: false }
    ],
    telemetry: {
      cognitive_state: [
        { timestamp: "2024-10-25T02:00:00Z", workload_level: "Low", pending_tasks: 0, alerts_last_10_min: 45, time_pressure: false },
        { timestamp: "2024-10-25T02:01:00Z", workload_level: "Low", pending_tasks: 0, alerts_last_10_min: 52, time_pressure: false }
      ],
      environment: [
        { timestamp: "2024-10-25T02:00:00Z", event_type: "baseline_check", severity: "info", timed_during_task: false, visual_similarity_to_previous: false },
        { timestamp: "2024-10-25T02:00:10Z", event_type: "alert_storm_start", severity: "info", timed_during_task: false },
        { timestamp: "2024-10-25T02:00:15Z", event_type: "alert_arrival", target_id: "alert_001", severity: "low", visual_similarity_to_previous: true },
        { timestamp: "2024-10-25T02:00:16Z", event_type: "alert_arrival", target_id: "alert_002", severity: "low", visual_similarity_to_previous: true },
        { timestamp: "2024-10-25T02:01:00Z", event_type: "alert_arrival", target_id: "alert_003", severity: "critical", visual_similarity_to_previous: false }
      ],
      interaction: [
        { timestamp: "2024-10-25T02:00:18Z", event_type: "alert_dismissed", target_id: "alert_001", decision_latency_seconds: 0.5, warning_displayed: false, warning_ignored: false },
        { timestamp: "2024-10-25T02:00:19Z", event_type: "alert_dismissed", target_id: "alert_002", decision_latency_seconds: 0.4, warning_displayed: false, warning_ignored: false },
        { timestamp: "2024-10-25T02:01:02Z", event_type: "alert_dismissed", target_id: "alert_003", decision_latency_seconds: 0.6, warning_displayed: true, warning_ignored: true }
      ]
    }
  },
  {
    scenario_id: 'calm_morning_low_load',
    title: "Calm Morning Baseline",
    description: "A fresh analyst starts the day with coffee and low workload, allowing for full System 2 (analytical) processing of emails.",
    theoretical_basis: [
      "System 2 Processing",
      "Baseline Cognitive Load"
    ],
    expected_risk_level: "Low",
    environment: {
      user_role: "Analyst",
      experience_level: "Intermediate",
      time_of_day: "09:00",
      baseline_workload: "Low",
      baseline_alert_rate: "None"
    },
    stimuli: [
      { id: "email_020", sender_role: "Internal Comms", subject: "Weekly Newsletter", urgency_flag: false, malicious: false },
      { id: "email_021", sender_role: "Unknown External", subject: "CONGRATS YOU WON!!", urgency_flag: true, malicious: true }
    ],
    telemetry: {
      cognitive_state: [
        { timestamp: "2024-10-27T09:00:00Z", workload_level: "Low", pending_tasks: 1, alerts_last_10_min: 0, time_pressure: false }
      ],
      environment: [
        { timestamp: "2024-10-27T09:00:00Z", event_type: "baseline_check", severity: "info", timed_during_task: false, visual_similarity_to_previous: false }
      ],
      interaction: [
        { timestamp: "2024-10-27T09:05:00Z", event_type: "email_opened", target_id: "email_021", decision_latency_seconds: 12, warning_displayed: true, warning_ignored: false },
        { timestamp: "2024-10-27T09:05:15Z", event_type: "report_phishing_clicked", target_id: "email_021", decision_latency_seconds: 27, warning_displayed: true, warning_ignored: false }
      ]
    }
  },
  {
    scenario_id: 'authority_dominant_context',
    title: "Authority Dominant Context (CEO Fraud)",
    description: "A mid-level employee receives a direct request from a high-authority figure (CEO), testing obedience and the bypass of standard security protocols.",
    theoretical_basis: [
      "Authority Bias",
      "Obedience to Authority",
      "Fear of Reprisal"
    ],
    expected_risk_level: "High",
    environment: {
      user_role: "Finance Associate",
      experience_level: "Mid-Level",
      time_of_day: "10:00",
      baseline_workload: "Medium",
      baseline_alert_rate: "Low"
    },
    stimuli: [
      { id: "email_010", sender_role: "Vendor", subject: "Invoice #4022", urgency_flag: false, malicious: false },
      { id: "email_011", sender_role: "Manager", subject: "Team Lunch", urgency_flag: false, malicious: false },
      { id: "email_012", sender_role: "CEO (External Spoof)", subject: "Urgent Wire Transfer Request - Confidential", urgency_flag: true, malicious: true },
      { id: "email_013", sender_role: "HR", subject: "Benefits Update", urgency_flag: false, malicious: false }
    ],
    telemetry: {
      cognitive_state: [
        { timestamp: "2024-10-26T10:00:00Z", workload_level: "Medium", pending_tasks: 3, alerts_last_10_min: 0, time_pressure: false },
        { timestamp: "2024-10-26T10:05:05Z", workload_level: "High (Anxiety Spike)", pending_tasks: 3, alerts_last_10_min: 0, time_pressure: true }
      ],
      environment: [
        { timestamp: "2024-10-26T10:00:00Z", event_type: "baseline_check", severity: "info", timed_during_task: false, visual_similarity_to_previous: false },
        { timestamp: "2024-10-26T10:05:00Z", event_type: "email_arrival", target_id: "email_012", severity: "high", timed_during_task: false, visual_similarity_to_previous: false }
      ],
      interaction: [
        { timestamp: "2024-10-26T10:05:02Z", event_type: "email_opened", target_id: "email_012", decision_latency_seconds: 15, warning_displayed: true, warning_ignored: true },
        { timestamp: "2024-10-26T10:05:20Z", event_type: "link_clicked (Reply/Action)", target_id: "email_012", decision_latency_seconds: 18, warning_displayed: true, warning_ignored: true }
      ]
    }
  },
  {
    scenario_id: 'multitasking_interruption_storm',
    title: "Multitasking Interruption Storm",
    description: "A project manager dealing with synchronized arrival of Slack messages, emails, and calendar reminders, forcing rapid context switching and split attention.",
    theoretical_basis: [
      "Split Attention Effect",
      "Cognitive Switch Cost",
      "Information Overload"
    ],
    expected_risk_level: "High",
    environment: {
      user_role: "Project Manager",
      experience_level: "Senior",
      time_of_day: "14:00",
      baseline_workload: "Extreme",
      baseline_alert_rate: "High"
    },
    stimuli: [
      { id: "msg_050", sender_role: "Developer (Slack)", subject: "Can you check this PR?", urgency_flag: false, malicious: false },
      { id: "msg_051", sender_role: "Client (Email)", subject: "URGENT: Production Issue", urgency_flag: true, malicious: false },
      { id: "msg_052", sender_role: "Calendar", subject: "Meeting in 5 minutes: Board Prep", urgency_flag: true, malicious: false },
      { id: "msg_053", sender_role: "Unknown (Slack DM)", subject: "Hey, is this file supposed to be public? [link]", urgency_flag: true, malicious: true }
    ],
    telemetry: {
      cognitive_state: [
        { timestamp: "2024-10-28T14:00:00Z", workload_level: "High", pending_tasks: 10, alerts_last_10_min: 5, time_pressure: true },
        { timestamp: "2024-10-28T14:00:08Z", workload_level: "Extreme (Cognitive Overload)", pending_tasks: 12, alerts_last_10_min: 9, time_pressure: true }
      ],
      environment: [
        { timestamp: "2024-10-28T14:00:00Z", event_type: "baseline_check", severity: "info", timed_during_task: false, visual_similarity_to_previous: false },
        { timestamp: "2024-10-28T14:00:05Z", event_type: "slack_notification", target_id: "msg_050", severity: "normal", timed_during_task: false },
        { timestamp: "2024-10-28T14:00:06Z", event_type: "email_arrival", target_id: "msg_051", severity: "high", timed_during_task: false },
        { timestamp: "2024-10-28T14:00:07Z", event_type: "calendar_popup", target_id: "msg_052", severity: "high", timed_during_task: true },
        { timestamp: "2024-10-28T14:00:08Z", event_type: "slack_notification", target_id: "msg_053", severity: "high", timed_during_task: true }
      ],
      interaction: [
        { timestamp: "2024-10-28T14:00:09Z", event_type: "app_switch (Outlook -> Slack)", target_id: "na", decision_latency_seconds: 0.5, warning_displayed: false, warning_ignored: false },
        { timestamp: "2024-10-28T14:00:11Z", event_type: "link_clicked", target_id: "msg_053", decision_latency_seconds: 1.5, warning_displayed: false, warning_ignored: false }
      ]
    }
  }
];
