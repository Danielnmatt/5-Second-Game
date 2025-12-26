export type GameMode = "normal" | "hard" | "mixed";

export const GAMEMODES: {id: GameMode; name: string, label: string, description: string}[] = [
  {id: "normal", name: "Normal Mode (Name 3)", label: "Normal", description: "(Name 3)",},
  {id: "hard", name: "Hard Mode (Name 5)", label: "Hard", description: "(Name 5)"},
  {id: "mixed", name: "Mixed Mode (Name 3 or 5)", label: "Mixed", description: "(Name 3 or 5)"},
];