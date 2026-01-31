export type Tour = "ATP" | "WTA";

export type RankingRow = {
  tour: Tour;
  rank: number;
  playerId: string;
  playerName: string;
  country: string;
  points: number;

  // + means moved up (good), - means moved down
  movement: number; // e.g. +2, -1, 0
};

export const rankings: RankingRow[] = [
  // ATP (sample)
  { tour: "ATP", rank: 1, playerId: "novak-djokovic", playerName: "Novak Djokovic", country: "SRB", points: 10250, movement: 0 },
  { tour: "ATP", rank: 2, playerId: "carlos-alcaraz", playerName: "Carlos Alcaraz", country: "ESP", points: 9550, movement: +1 },
  { tour: "ATP", rank: 3, playerId: "jannik-sinner", playerName: "Jannik Sinner", country: "ITA", points: 9050, movement: -1 },
  { tour: "ATP", rank: 4, playerId: "daniil-medvedev", playerName: "Daniil Medvedev", country: "RUS", points: 8350, movement: 0 },
  { tour: "ATP", rank: 5, playerId: "alexander-zverev", playerName: "Alexander Zverev", country: "GER", points: 7920, movement: +2 },

  // WTA (sample)
  { tour: "WTA", rank: 1, playerId: "iga-swiatek", playerName: "Iga Świątek", country: "POL", points: 10980, movement: 0 },
  { tour: "WTA", rank: 2, playerId: "aryna-sabalenka", playerName: "Aryna Sabalenka", country: "BLR", points: 9850, movement: 0 },
  { tour: "WTA", rank: 3, playerId: "coco-gauff", playerName: "Coco Gauff", country: "USA", points: 8450, movement: +1 },
  { tour: "WTA", rank: 4, playerId: "elena-rybakina", playerName: "Elena Rybakina", country: "KAZ", points: 8200, movement: -1 },
  { tour: "WTA", rank: 5, playerId: "jessica-pegula", playerName: "Jessica Pegula", country: "USA", points: 7880, movement: 0 },
];
