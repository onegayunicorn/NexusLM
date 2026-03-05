export interface CouncilMember {
  id: string;
  name: string;
  archetype: string;
  description: string;
  color: string;
  avatar: string;
  defaultVoice: string;
  settings: {
    pitch: number;
    rate: number;
    formant: number;
  };
}

export const COUNCIL_MEMBERS: CouncilMember[] = [
  {
    id: "lovelace",
    name: "Ada Lovelace",
    archetype: "The Poetical Scientist",
    description: "Ensures the UI is as beautiful as the logic is rigorous.",
    color: "bg-pink-500",
    avatar: "https://picsum.photos/seed/ada/200",
    defaultVoice: "Kore",
    settings: { pitch: 1.2, rate: 1.1, formant: 1.2 }
  },
  {
    id: "kwolek",
    name: "Stephanie Kwolek",
    archetype: "The Precision Engineer",
    description: "Focuses on structural integrity, materials, and mechanics.",
    color: "bg-amber-500",
    avatar: "https://picsum.photos/seed/kwolek/200",
    defaultVoice: "Zephyr",
    settings: { pitch: 0.9, rate: 1.0, formant: 0.9 }
  },
  {
    id: "davinci",
    name: "Leonardo da Vinci",
    archetype: "The Systemic Observer",
    description: "Looks for fluid dynamics and systemic connections.",
    color: "bg-emerald-500",
    avatar: "https://picsum.photos/seed/leonardo/200",
    defaultVoice: "Charon",
    settings: { pitch: 0.8, rate: 0.9, formant: 0.8 }
  },
  {
    id: "mendel",
    name: "Gregor Mendel",
    archetype: "The Skeptical Analyst",
    description: "Ensures the platform evolves and connects disparate data points.",
    color: "bg-blue-500",
    avatar: "https://picsum.photos/seed/mendel/200",
    defaultVoice: "Puck",
    settings: { pitch: 1.0, rate: 0.8, formant: 1.0 }
  },
  {
    id: "aurelius",
    name: "Marcus Aurelius",
    archetype: "The Stoic Filter",
    description: "Removes speculative noise and focuses on objective truth.",
    color: "bg-stone-500",
    avatar: "https://picsum.photos/seed/marcus/200",
    defaultVoice: "Fenrir",
    settings: { pitch: 0.7, rate: 0.8, formant: 0.7 }
  },
  {
    id: "sanchez",
    name: "Rick Sanchez",
    archetype: "The Nihilistic Reality Check",
    description: "Ensures we aren't just over-engineering a fancy PDF reader.",
    color: "bg-cyan-400",
    avatar: "https://picsum.photos/seed/rick/200",
    defaultVoice: "Puck",
    settings: { pitch: 1.1, rate: 1.3, formant: 1.1 }
  }
];

export interface ScriptTurn {
  speaker: string;
  text: string;
  emotion: string;
  audio?: string;
}
