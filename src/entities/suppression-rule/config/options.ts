// Варианты значений для селектов action / severity / decision правила подавления
export const actionAction = [
  {
    value: "block",
    label: "Block",
  },
  {
    value: "investigate",
    label: "Investigate",
  },
  {
    value: "monitor",
    label: "Monitor",
  },
  {
    value: "ignore",
    label: "Ignore",
  },
];

export const actionSeverity = [
  {
    value: "critical",
    label: "Critical",
  },
  {
    value: "high",
    label: "High",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "low",
    label: "Low",
  },
  {
    value: "info",
    label: "Info",
  },
];

export const actionDecision = [
  {
    value: "malicious",
    label: "Malicious",
  },
  {
    value: "suspicious",
    label: "Suspicious",
  },
  {
    value: "benign",
    label: "Benign",
  },
];
