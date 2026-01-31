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
  { id: "jannik-sinner", name: "Jannik Sinner", tour: "ATP", country: "ITA", handed: "R" },
  { id: "daniil-medvedev", name: "Daniil Medvedev", tour: "ATP", country: "RUS", handed: "R" },

  { id: "iga-swiatek", name: "Iga Świątek", tour: "WTA", country: "POL", handed: "R" },
  { id: "aryna-sabalenka", name: "Aryna Sabalenka", tour: "WTA", country: "BLR", handed: "R" },
  { id: "coco-gauff", name: "Coco Gauff", tour: "WTA", country: "USA", handed: "R" },
  { id: "elena-rybakina", name: "Elena Rybakina", tour: "WTA", country: "KAZ", handed: "R" },
];
