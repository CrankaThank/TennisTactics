export type MatchStatus = "upcoming" | "live" | "finished";

export type MatchPlayer = {
  id: string;
  name: string;
};

export type MatchPointWinner = "p1" | "p2";

export type MatchPoint = {
  id: string;
  set: number; // 1-based
  game: number; // 1-based
  point: number; // 1-based inside the game (sequence)
  server: MatchPointWinner;
  winner: MatchPointWinner;
  label: string; // short description: "Ace", "Forehand winner", etc.
  atISO: string; // ISO timestamp (stable)
};

export type Match = {
  id: string;
  tour: "ATP" | "WTA";
  tournamentId: string;
  tournamentName: string;
  round: string;
  startTime: string; // ISO stable
  status: MatchStatus;

  p1: MatchPlayer;
  p2: MatchPlayer;

  // For finished matches, set winnerId to p1.id or p2.id
  winnerId?: string;

  // Optional display (supports tie-break format like 7-6(5) 6-7(8) 10-8)
  score?: string;

  // Optional: live point-by-point feed (sample)
  livePoints?: MatchPoint[];
};

export const matches: Match[] = [
  {
    id: "m1",
    tour: "ATP",
    tournamentId: "doha-2026",
    tournamentName: "Doha",
    round: "R16",
    startTime: "2026-01-29T18:00:00Z",
    status: "finished",
    p1: { id: "carlos-alcaraz", name: "Carlos Alcaraz" },
    p2: { id: "jannik-sinner", name: "Jannik Sinner" },
    winnerId: "carlos-alcaraz",
    score: "6-4 3-6 6-3",
  },
  {
    id: "m2",
    tour: "WTA",
    tournamentId: "doha-2026",
    tournamentName: "Doha",
    round: "QF",
    startTime: "2026-01-30T12:00:00Z",
    status: "finished",
    p1: { id: "coco-gauff", name: "Coco Gauff" },
    p2: { id: "aryna-sabalenka", name: "Aryna Sabalenka" },
    winnerId: "aryna-sabalenka",
    score: "6-3 6-4",
  },
  {
    id: "m3",
    tour: "ATP",
    tournamentId: "australian-open-2026",
    tournamentName: "Australian Open",
    round: "SF",
    startTime: "2026-01-22T09:00:00Z",
    status: "finished",
    p1: { id: "novak-djokovic", name: "Novak Djokovic" },
    p2: { id: "daniil-medvedev", name: "Daniil Medvedev" },
    winnerId: "novak-djokovic",
    // Example with a tie-break:
    score: "7-6(5) 6-4 6-2",
  },
  {
    id: "m4",
    tour: "WTA",
    tournamentId: "australian-open-2026",
    tournamentName: "Australian Open",
    round: "F",
    startTime: "2026-01-24T08:30:00Z",
    status: "finished",
    p1: { id: "iga-swiatek", name: "Iga Świątek" },
    p2: { id: "elena-rybakina", name: "Elena Rybakina" },
    winnerId: "iga-swiatek",
    // Example with a tie-break:
    score: "6-2 6-7(8) 6-3",
  },
  {
    id: "m5",
    tour: "ATP",
    tournamentId: "miami-2026",
    tournamentName: "Miami",
    round: "R32",
    startTime: "2026-02-02T17:00:00Z",
    status: "upcoming",
    p1: { id: "carlos-alcaraz", name: "Carlos Alcaraz" },
    p2: { id: "daniil-medvedev", name: "Daniil Medvedev" },
  },
  {
    id: "m6",
    tour: "WTA",
    tournamentId: "miami-2026",
    tournamentName: "Miami",
    round: "R32",
    startTime: "2026-02-02T20:00:00Z",
    status: "upcoming",
    p1: { id: "aryna-sabalenka", name: "Aryna Sabalenka" },
    p2: { id: "iga-swiatek", name: "Iga Świątek" },
  },
  {
    id: "m7",
    tour: "ATP",
    tournamentId: "miami-2026",
    tournamentName: "Miami",
    round: "R16",
    startTime: "2026-02-01T19:30:00Z",
    status: "live",
    p1: { id: "novak-djokovic", name: "Novak Djokovic" },
    p2: { id: "jannik-sinner", name: "Jannik Sinner" },
    score: "6-4 2-3",
    // Sample live point-by-point feed (fake data)
    livePoints: [
      {
        id: "p001",
        set: 2,
        game: 6,
        point: 1,
        server: "p1",
        winner: "p1",
        label: "Ace (T)",
        atISO: "2026-02-01T20:31:10Z",
      },
      {
        id: "p002",
        set: 2,
        game: 6,
        point: 2,
        server: "p1",
        winner: "p2",
        label: "Backhand return winner",
        atISO: "2026-02-01T20:31:32Z",
      },
      {
        id: "p003",
        set: 2,
        game: 6,
        point: 3,
        server: "p1",
        winner: "p1",
        label: "Forehand winner",
        atISO: "2026-02-01T20:31:58Z",
      },
      {
        id: "p004",
        set: 2,
        game: 6,
        point: 4,
        server: "p1",
        winner: "p2",
        label: "Forced error (wide)",
        atISO: "2026-02-01T20:32:20Z",
      },
      {
        id: "p005",
        set: 2,
        game: 6,
        point: 5,
        server: "p1",
        winner: "p1",
        label: "Serve +1 winner",
        atISO: "2026-02-01T20:32:44Z",
      },
    ],
  },
];
