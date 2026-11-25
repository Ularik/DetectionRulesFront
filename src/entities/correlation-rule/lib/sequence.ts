// Элемент sequence: «rule:<rule_id>» — конкретное правило обнаружения,
// иначе — категория детектирования или тип атаки (значения справочника /correlation-rules/sequence)

export const RULE_STEP_PREFIX = "rule:";

export const isRuleStep = (step: string) => step.startsWith(RULE_STEP_PREFIX);

export const ruleStepId = (step: string) => step.slice(RULE_STEP_PREFIX.length);

export const toRuleStep = (ruleId: string) => `${RULE_STEP_PREFIX}${ruleId}`;
