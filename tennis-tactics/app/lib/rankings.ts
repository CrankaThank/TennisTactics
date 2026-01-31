export type RankingEntry = {
  rank: number;
  playerId: string;
  name: string;
  country: string; // 3-letter code
  points: number;
  tour: "ATP" | "WTA";
  movement: number; // + up, - down, 0 same
};

export const rankings: RankingEntry[] = [
  { rank: 1, playerId: "novak-djokovic", name: "Novak Djokovic", country: "SRB", points: 10500, tour: "ATP", movement: 0 },
  { rank: 2, playerId: "carlos-alcaraz", name: "Carlos Alcaraz", country: "ESP", points: 9200, tour: "ATP", movement: +1 },
  { rank: 3, playerId: "jannik-sinner", name: "Jannik Sinner", country: "ITA", points: 8800, tour: "ATP", movement: -1 },
  { rank: 4, playerId: "daniil-medvedev", name: "Daniil Medvedev", country: "RUS", points: 7600, tour: "ATP", movement: 0 },

  { rank: 1, playerId: "iga-swiatek", name: "Iga Świątek", country: "POL", points: 9600, tour: "WTA", movement: 0 },
  { rank: 2, playerId: "aryna-sabalenka", name: "Aryna Sabalenka", country: "BLR", points: 9100, tour: "WTA", movement: 0 },
  { rank: 3, playerId: "coco-gauff", name: "Coco Gauff", country: "USA", points: 7200, tour: "WTA", movement: +1 },
  { rank: 4, playerId: "elena-rybakina", name: "Elena Rybakina", country: "KAZ", points: 6800, tour: "WTA", movement: -1 },
];
