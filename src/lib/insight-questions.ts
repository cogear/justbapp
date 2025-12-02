export interface InsightQuestion {
    id: string;
    text: string;
    type: 'choice' | 'multi_select' | 'text';
    options?: string[];
    phase: number;
}

export const INSIGHT_QUESTIONS: InsightQuestion[] = [
    // Phase 1: The Triage (Day 1 - Day 3)
    {
        id: 'stress_response',
        phase: 1,
        text: "When you hear bad news, what helps you cope better: Knowing the emotional human story, or seeing the cold, hard data?",
        type: 'choice',
        options: ["Emotional human story", "Cold, hard data"]
    },
    {
        id: 'radioactive_topics',
        phase: 1,
        text: "Is there a specific topic that, if you see it today, will ruin your entire morning?",
        type: 'multi_select',
        options: ["Politics", "Violence against Children", "Animal Cruelty", "Financial Crashes", "Health Scares"]
    },
    {
        id: 'sphere_of_control',
        phase: 1,
        text: "To feel grounded, do you prefer to keep your eyes on the whole world, or just your own backyard?",
        type: 'choice',
        options: ["Whole world", "My own backyard"]
    },

    // Phase 2: The Context (Day 4 - Day 10)
    {
        id: 'protector_status',
        phase: 2,
        text: "Who relies on you for their safety and well-being right now?",
        type: 'multi_select',
        options: ["Children", "Aging Parents", "Pets", "Just Myself"]
    },
    {
        id: 'economic_anxiety',
        phase: 2,
        text: "When you see headlines about the economy, do you feel: Secure and curious OR Tense and vulnerable?",
        type: 'choice',
        options: ["Secure and curious", "Tense and vulnerable"]
    },
    {
        id: 'political_tolerance',
        phase: 2,
        text: "Regarding politics, are you currently in a season of 'Fighting for Change' or 'Protecting your Peace'?",
        type: 'choice',
        options: ["Fighting for Change", "Protecting your Peace"]
    },

    // Phase 3: The Remedy (Day 11+)
    {
        id: 'joy_anchors',
        phase: 3,
        text: "If you had 10 minutes of absolute silence, what would you reach for? A warm drink, a soft blanket, or fresh air?",
        type: 'choice',
        options: ["Warm drink", "Soft blanket", "Fresh air"]
    },
    {
        id: 'action_bias',
        phase: 3,
        text: "Does helping others make you feel less anxious, or more drained?",
        type: 'choice',
        options: ["Less anxious", "More drained"]
    }
];
