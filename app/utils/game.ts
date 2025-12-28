export type GameMode = "normal" | "normalMature" | "hard" | "hardMature";

export const GAMEMODES: {id: GameMode; name: string, label: string, description: string}[] = [
  {id: "normal", name: "Normal Mode (Name 3)", label: "Normal", description: "(Name 3)",},
  {id: "normalMature", name: "Normal Mode Mature", label: "Normal (18+)", description: "(Name 3)"},
  {id: "hard", name: "Hard Mode (Name 5)", label: "Hard", description: "(Name 5)"},
  {id: "hardMature", name: "Hard Mode Mature", label: "Hard (18+)", description: "(Name 5)"},
];