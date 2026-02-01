export type MatchStatus = "upcoming" | "live" | "finished";
export type Tour = "ATP" | "WTA";

export type MatchPlayerRef = {
  id: string;
  name: string;
};

export type MatchPoint = {
  id: string;
  set: number;
  game: number;
  point: number;
  server: "p1" | "p2";
  winner: "p1" | "p2";
  label?: string;
  atISO: string;
};

export type Match = {
  id: string;

  tour: Tour;
  tournamentId: string;
  tournamentName: string;

  round: string;
  surface: "Hard" | "Clay" | "Grass";

  startTime: string; // ISO string
  status: MatchStatus;

  p1: MatchPlayerRef;
  p2: MatchPlayerRef;

  // Only for finished (and sometimes live)
  winnerId?: string;
  score?: string;

  // Optional: used by live simulation page
  points?: MatchPoint[];
};

export const matches: Match[] = [
  // -------------------------
  // WTA — Doha
  // -------------------------
  {
    id: "wta-doha-2026-qf-gauff-sabalenka",
    tour: "WTA",
    tournamentId: "doha-2026-wta",
    tournamentName: "Doha",
    round: "QF",
    surface: "Hard",
    startTime: "2026-01-30T12:00:00.000Z",
    status: "finished",
    p1: { id: "coco-gauff", name: "Coco Gauff" },
    p2: { id: "aryna-sabalenka", name: "Aryna Sabalenka" },
    winnerId: "aryna-sabalenka",
    score: "6-3 6-4",
  },

  // -------------------------
  // WTA — Miami
  // -------------------------
  {
    id: "wta-miami-2026-r32-sabalenka-swiatek",
    tour: "WTA",
    tournamentId: "miami-2026-wta",
    tournamentName: "Miami",
    round: "R32",
    surface: "Hard",
    startTime: "2026-02-02T20:00:00.000Z",
    status: "upcoming",
    p1: { id: "aryna-sabalenka", name: "Aryna Sabalenka" },
    p2: { id: "iga-swiatek", name: "Iga Świątek" },
  },

  // -------------------------
  // ATP — Australian Open
  // -------------------------
  {
    id: "atp-ausopen-2026-sf-djokovic-medvedev",
    tour: "ATP",
    tournamentId: "australian-open-2026-atp",
    tournamentName: "Australian Open",
    round: "SF",
    surface: "Hard",
    startTime: "2026-01-22T09:00:00.000Z",
    status: "finished",
    p1: { id: "novak-djokovic", name: "Novak Djokovic" },
    p2: { id: "daniil-medvedev", name: "Daniil Medvedev" },
    winnerId: "novak-djokovic",
    score: "7-6 6-4 6-2",
  },

  // -------------------------
  // ATP — Doha (separate tournament id from WTA Doha)
  // -------------------------
  {
    id: "atp-doha-2026-r16-alcaraz-sinner",
    tour: "ATP",
    tournamentId: "doha-2026-atp",
    tournamentName: "Doha",
    round: "R16",
    surface: "Hard",
    startTime: "2026-01-29T18:00:00.000Z",
    status: "finished",
    p1: { id: "carlos-alcaraz", name: "Carlos Alcaraz" },
    p2: { id: "jannik-sinner", name: "Jannik Sinner" },
    winnerId: "carlos-alcaraz",
    score: "6-4 6-3",
  },

  // -------------------------
  // ATP — Miami
  // -------------------------
  {
    id: "atp-miami-2026-r32-alcaraz-medvedev",
    tour: "ATP",
    tournamentId: "miami-2026-atp",
    tournamentName: "Miami",
    round: "R32",
    surface: "Hard",
    startTime: "2026-02-02T17:00:00.000Z",
    status: "upcoming",
    p1: { id: "carlos-alcaraz", name: "Carlos Alcaraz" },
    p2: { id: "daniil-medvedev", name: "Daniil Medvedev" },
  },
];
