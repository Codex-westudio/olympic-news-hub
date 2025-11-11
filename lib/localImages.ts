const SPORT_IMAGE_MAP: Record<string, string> = {
  athletics: "/images/sports/athletics.svg",
  football: "/images/sports/football.svg",
  aquatics: "/images/sports/aquatics.svg",
  judo: "/images/sports/judo.svg",
  "table-tennis": "/images/sports/table-tennis.svg",
  volleyball: "/images/sports/volleyball.svg",
  cycling: "/images/sports/cycling.svg",
  gymnastics: "/images/sports/gymnastics.svg",
  multisport: "/images/sports/multisport.svg",
  default: "/images/sports/default.svg",
};

const normalize = (sport: string) => sport.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function getLocalImageForSport(sport: string) {
  const key = normalize(sport);
  return SPORT_IMAGE_MAP[key] ?? SPORT_IMAGE_MAP.default;
}
