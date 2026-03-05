export interface CouncilMember {
  id: string;
  name: string;
  archetype: string;
  description: string;
  color: string;
  avatar: string;
}

export const COUNCIL_MEMBERS: CouncilMember[] = [
  {
    id: "mendel",
    name: "Gregor Mendel",
    archetype: "The Skeptical Analyst",
    description: "Focused on data, ratios, and rigorous evidence.",
    color: "bg-blue-500",
    avatar: "https://picsum.photos/seed/mendel/200",
  },
  {
    id: "carver",
    name: "George Washington Carver",
    archetype: "The Practical Visionary",
    description: "Sees the potential in every seed and the soul of nature.",
    color: "bg-emerald-500",
    avatar: "https://picsum.photos/seed/carver/200",
  },
  {
    id: "kwolek",
    name: "Stephanie Kwolek",
    archetype: "The Precision Engineer",
    description: "Obsessed with structural integrity and material mechanics.",
    color: "bg-amber-500",
    avatar: "https://picsum.photos/seed/kwolek/200",
  },
  {
    id: "humboldt",
    name: "Alexander von Humboldt",
    archetype: "The Connector",
    description: "Links ecology, geography, and global systems.",
    color: "bg-purple-500",
    avatar: "https://picsum.photos/seed/humboldt/200",
  },
];

export interface ScriptTurn {
  speaker: string;
  text: string;
  emotion: string;
  audio?: string;
}
