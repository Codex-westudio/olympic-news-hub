export const SPORT_OPTIONS = [
  "Athletics",
  "Football",
  "Aquatics",
  "Judo",
  "Table Tennis",
  "Volleyball",
  "Cycling",
  "Gymnastics",
  "Multisport",
];

export const ORGANISATION_TYPES = ["IF", "IOC", "NOC", "OCOG"] as const;

export const CONTENT_TYPES = [
  "news",
  "communiqué",
  "résultat",
  "règlement",
  "nomination",
  "rapport",
  "événement",
] as const;

export const LANGUAGES = ["EN", "FR", "ES", "PT", "DE", "IT", "JA", "KO", "ZH", "AR"] as const;

export const COUNTRIES = [
  "AUS",
  "BRA",
  "CAN",
  "CHE",
  "COL",
  "DEU",
  "ESP",
  "FRA",
  "GBR",
  "HUN",
  "ITA",
  "JPN",
  "KOR",
  "MEX",
  "MON",
  "POL",
  "QAT",
  "SGP",
  "SUI",
  "TUN",
  "USA",
] as const;

export const TOPICS = [
  "gouvernance",
  "calendrier",
  "intégrité",
  "athlètes",
  "durabilité",
  "innovation",
  "sécurité",
  "formation",
  "opérations",
] as const;

export const SORT_OPTIONS = [
  { value: "date_desc", label: "Plus récents" },
  { value: "date_asc", label: "Plus anciens" },
  { value: "official_desc", label: "Poids officiel" },
] as const;
