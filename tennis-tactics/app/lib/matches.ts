export type MatchStatus = "upcoming" | "live" | "finished";

export type Match = {
  id: string;
  tour: "ATP" | "WTA";
  tournamentId: string; // links to tournaments.ts
  tournamentName: string; // for display
  round: string;
  court?: string;
  status: MatchStatus;

  startTime: string; // stable ISO

  p1: { id: string; name: string };
  p2: { id: string; name: string };

  score?: string;
};

export const matches: Match[] = [
  {
    id: "m1",
    tour: "ATP",
    tournamentId: "australian-open",
    tournamentName: "Australian Open",
    round: "R1",
    status: "upcoming",
    startTime: "2026-01-31T13:00:00Z",
    p1: { id: "novak-djokovic", name: "Novak Djokovic" },
    p2: { id: "carlos-alcaraz", name: "Carlos Alcaraz" },
  },
  {
    id: "m2",
    tour: "WTA",
    tournamentId: "doha",
    tournamentName: "Doha",
    round: "QF",
    status: "finished",
    startTime: "2026-01-31T08:00:00Z",
    p1: { id: "iga-swiatek", name: "Iga Świątek" },
    p2: { id: "aryna-sabalenka", name: "Aryna Sabalenka" },
    score: "6-4 6-3",
  },
  {
    id: "m3",
    tour: "ATP",
    tournamentId: "australian-open",
    tournamentName: "Australian Open",
    round: "R1",
    status: "live",
    startTime: "2026-01-31T12:30:00Z",
    p1: { id: "novak-djokovic", name: "Novak Djokovic" },
    p2: { id: "carlos-alcaraz", name: "Carlos Alcaraz" },
    score: "6-4 2-3",
  },
  {
    id: "m4",
    tour: "WTA",
    tournamentId: "doha",
    tournamentName: "Doha",
    round: "SF",
    status: "upcoming",
    startTime: "2026-01-31T15:00:00Z",
    p1: { id: "iga-swiatek", name: "Iga Świątek" },
    p2: { id: "aryna-sabalenka", name: "Aryna Sabalenka" },
  },
];
