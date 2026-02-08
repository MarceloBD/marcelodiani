export interface CityTimezone {
  id: string;
  translationKey: string;
  timezone: string;
  flag: string;
  isHome?: boolean;
}

export const CITY_TIMEZONES: CityTimezone[] = [
  {
    id: "san-francisco",
    translationKey: "sanFrancisco",
    timezone: "America/Los_Angeles",
    flag: "\u{1F1FA}\u{1F1F8}",
  },
  {
    id: "new-york",
    translationKey: "newYork",
    timezone: "America/New_York",
    flag: "\u{1F1FA}\u{1F1F8}",
  },
  {
    id: "sao-paulo",
    translationKey: "saoPaulo",
    timezone: "America/Sao_Paulo",
    flag: "\u{1F1E7}\u{1F1F7}",
    isHome: true,
  },
  {
    id: "london",
    translationKey: "london",
    timezone: "Europe/London",
    flag: "\u{1F1EC}\u{1F1E7}",
  },
  {
    id: "berlin",
    translationKey: "berlin",
    timezone: "Europe/Berlin",
    flag: "\u{1F1E9}\u{1F1EA}",
  },
  {
    id: "singapore",
    translationKey: "singapore",
    timezone: "Asia/Singapore",
    flag: "\u{1F1F8}\u{1F1EC}",
  },
  {
    id: "tokyo",
    translationKey: "tokyo",
    timezone: "Asia/Tokyo",
    flag: "\u{1F1EF}\u{1F1F5}",
  },
];
