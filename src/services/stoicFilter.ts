export enum InsightCategory {
  INTERNAL_CONTROL = "INTERNAL_CONTROL",
  EXTERNAL_NOISE = "EXTERNAL_NOISE",
  OBJECTIVE_TRUTH = "OBJECTIVE_TRUTH"
}

export interface StoicInsight {
  category: InsightCategory;
  content: string;
  actionable: boolean;
}

export class StoicFilter {
  /**
   * This is a conceptual implementation of the Stoic Filter.
   * In a real-world scenario, this might involve pre-processing text 
   * or post-processing LLM output to ensure it adheres to Stoic principles.
   */
  static apply(text: string): string {
    // For now, we'll use this to wrap the prompt logic
    return text;
  }

  static getPromptInstructions(): string {
    return `
      STOIC FILTER LOGIC:
      When generating dialogue, apply the "Stoic Filter":
      1. Identify INTERNAL_CONTROL (actions the user can take, objective facts).
      2. Identify EXTERNAL_NOISE (speculation, marketing fluff, uncontrollable factors).
      3. Prioritize INTERNAL_CONTROL and objective truth.
      
      Categorize insights into:
      - INTERNAL_CONTROL: Actionable engineering steps, local build configurations.
      - EXTERNAL_NOISE: Speculative third-party API fluctuations, marketing-driven narrative.
      - OBJECTIVE_TRUTH: Hard-coded parameters, hardware specifications.
    `;
  }
}
