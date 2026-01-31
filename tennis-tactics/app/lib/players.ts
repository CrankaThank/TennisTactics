export type Player = {
  id: string;
  name: string;
  tour: "ATP" | "WTA";
  country: string;
  handed: "R" | "L";
};

export const players: Player[] = [
  { id: "novak-djokovic", name: "Novak Djokovic", tour: "ATP", country: "SRB", handed: "R" },
  { id: "carlos-alcaraz", name: "Carlos Alcaraz", tour: "ATP", country: "ESP", handed: "R" },
  { id: "iga-swiatek", name: "Iga Świątek", tour: "WTA", country: "POL", handed: "R" },
  { id: "aryna-sabalenka", name: "Aryna Sabalenka", tour: "WTA", country: "BLR", handed: "R" },
];
