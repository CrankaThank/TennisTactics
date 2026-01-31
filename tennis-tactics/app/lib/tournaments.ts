export type Tournament = {
  id: string;
  name: string;
  tour: "ATP" | "WTA";
  location: string;
  surface: "Hard" | "Clay" | "Grass" | "Carpet";
  level: "Grand Slam" | "Masters" | "WTA 1000" | "ATP 500" | "ATP 250" | "WTA 500" | "WTA 250" | "Challenger";
  website?: string;
};

export const tournaments: Tournament[] = [
  {
    id: "australian-open",
    name: "Australian Open",
    tour: "ATP",
    location: "Melbourne, AUS",
    surface: "Hard",
    level: "Grand Slam",
  },
  {
    id: "doha",
    name: "Doha",
    tour: "WTA",
    location: "Doha, QAT",
    surface: "Hard",
    level: "WTA 1000",
  },
];
