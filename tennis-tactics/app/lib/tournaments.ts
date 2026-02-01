export type Tour = "ATP" | "WTA";

export type Tournament = {
  id: string;
  tour: Tour;
  name: string;
  location: string;
  surface: "Hard" | "Clay" | "Grass";
  level: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
};

export const tournaments: Tournament[] = [
  // --- WTA ---
  {
    id: "doha-2026-wta",
    tour: "WTA",
    name: "Doha",
    location: "Doha, QAT",
    surface: "Hard",
    level: "WTA 1000",
    startDate: "2026-02-09",
    endDate: "2026-02-15",
  },
  {
    id: "miami-2026-wta",
    tour: "WTA",
    name: "Miami",
    location: "Miami, USA",
    surface: "Hard",
    level: "WTA 1000",
    startDate: "2026-03-18",
    endDate: "2026-03-31",
  },

  // --- ATP ---
  {
    id: "australian-open-2026-atp",
    tour: "ATP",
    name: "Australian Open",
    location: "Melbourne, AUS",
    surface: "Hard",
    level: "Grand Slam",
    startDate: "2026-01-12",
    endDate: "2026-01-26",
  },
  {
    id: "doha-2026-atp",
    tour: "ATP",
    name: "Doha",
    location: "Doha, QAT",
    surface: "Hard",
    level: "ATP 250",
    startDate: "2026-01-26",
    endDate: "2026-02-01",
  },
  {
    id: "miami-2026-atp",
    tour: "ATP",
    name: "Miami",
    location: "Miami, USA",
    surface: "Hard",
    level: "Masters",
    startDate: "2026-03-18",
    endDate: "2026-03-31",
  },
];
