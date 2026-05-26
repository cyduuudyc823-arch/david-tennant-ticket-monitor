export const event = {
  performer: "David Tennant",
  show: "White Rabbit Red Rabbit",
  venue: "Duchess Theatre, London",
  performanceLocal: "2026-06-15T19:30:00+01:00",
  finalWeekStartLocal: "2026-06-08T19:30:00+01:00",
  timeZone: "Europe/London"
};

export const sources = [
  {
    id: "nimax-official",
    name: "Nimax official ticketing",
    kind: "official",
    url: "https://ticketing.nimaxtheatres.com/shop/tickets/series/DUWRR01C/white-rabbit-red-rabbit-david-tennant-2082223",
    fallbackUrl: "https://nimaxtheatres.com/shows/wrrr/"
  },
  {
    id: "todaytix",
    name: "TodayTix",
    kind: "trusted ticketing",
    url: "https://www.todaytix.com/london/shows/46808-white-rabbit-red-rabbit"
  },
  {
    id: "twickets",
    name: "Twickets",
    kind: "trusted resale",
    url: "https://www.twickets.live/en/uk/tickets/theatre/white-rabbit-red-rabbit"
  }
];

export const statusPath = "data/status.json";
