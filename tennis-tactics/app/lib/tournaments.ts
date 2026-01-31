export type Tournament = {
  id: string;
  name: string;
  tour: "ATP" | "WTA";
  location: string;
  surface: "Hard" | "Clay" | "Grass" | "Carpet";
  level:
    | "Grand Slam"
    | "Masters"
    | "ATP 500"
    | "ATP 250"
    | "WTA 1000"
    | "WTA 500"
    | "WTA 250"
    | "Challenger";

  // Stable dates for grouping/sorting
  startDate: string; // ISO (YYYY-MM-DD)
  endDate: string; // ISO (YYYY-MM-DD)
  website?: string;
};

export const tournaments: Tournament[] = [
  {
    id: "australian-open-2026",
    name: "Australian Open",
    tour: "ATP",
    location: "Melbourne, AUS",
    surface: "Hard",
    level: "Grand Slam",
    startDate: "2026-01-12",
    endDate: "2026-01-26",
  },
  {
    id: "doha-2026",
    name: "Doha",
    tour: "WTA",
    location: "Doha, QAT",
    surface: "Hard",
    level: "WTA 1000",
    startDate: "2026-02-09",
    endDate: "2026-02-15",
  },
  {
    id: "miami-2026",
    name: "Miami",
    tour: "ATP",
    location: "Miami, USA",
    surface: "Hard",
    level: "Masters",
    startDate: "2026-03-18",
    endDate: "2026-03-31",
  },
];
