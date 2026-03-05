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
    id: "mendel",
    name: "Gregor Mendel",
    archetype: "The Skeptical Analyst",
    description: "Focused on data, ratios, and rigorous evidence.",
    color: "bg-blue-500",
    avatar: "https://picsum.photos/seed/mendel/200",
    defaultVoice: "Charon",
    settings: { pitch: 1.0, rate: 1.0, formant: 1.0 }
  },
  {
    id: "carver",
    name: "George Washington Carver",
    archetype: "The Practical Visionary",
    description: "Sees the potential in every seed and the soul of nature.",
    color: "bg-emerald-500",
    avatar: "https://picsum.photos/seed/carver/200",
    defaultVoice: "Fenrir",
    settings: { pitch: 1.0, rate: 1.0, formant: 1.0 }
  },
  {
    id: "kwolek",
    name: "Stephanie Kwolek",
    archetype: "The Precision Engineer",
    description: "Obsessed with structural integrity and material mechanics.",
    color: "bg-amber-500",
    avatar: "https://picsum.photos/seed/kwolek/200",
    defaultVoice: "Kore",
    settings: { pitch: 1.0, rate: 1.0, formant: 1.0 }
  },
  {
    id: "humboldt",
    name: "Alexander von Humboldt",
    archetype: "The Connector",
    description: "Links ecology, geography, and global systems.",
    color: "bg-purple-500",
    avatar: "https://picsum.photos/seed/humboldt/200",
    defaultVoice: "Zephyr",
    settings: { pitch: 1.0, rate: 1.0, formant: 1.0 }
  },
  {
    id: "homer",
    name: "Homer Simpson",
    archetype: "The Everyman Philosopher",
    description: "Finds wisdom in donuts and simplicity in chaos.",
    color: "bg-yellow-400",
    avatar: "https://picsum.photos/seed/homer/200",
    defaultVoice: "Puck",
    settings: { pitch: 0.8, rate: 0.9, formant: 0.85 }
  },
  {
    id: "rick",
    name: "Rick Sanchez",
    archetype: "The Nihilistic Genius",
    description: "Science is a mess, and so is the multiverse.",
    color: "bg-cyan-400",
    avatar: "https://picsum.photos/seed/rick/200",
    defaultVoice: "Charon",
    settings: { pitch: 1.1, rate: 1.2, formant: 1.1 }
  }
];

export interface ScriptTurn {
  speaker: string;
  text: string;
  emotion: string;
  audio?: string;
}
