export const vedicAstroConfig = {
  baseURL: process.env.VEDIC_ASTRO_BASE_URL || "https://api.vedicastroapi.com/v3-json",
  apiKey: process.env.VEDIC_ASTRO_API_KEY || "",
  timeout: 10000,
  endpoints: {
    manglikDosh: "/dosha/manglik-dosh",
    kalsarpDosh: "/dosha/kalsarp-dosh",
    sadesati: "/dosha/sadesati",
    pitradosh: "/dosha/pitra-dosh",
    nadiDosh: "/dosha/nadi-dosh",
    birthChart: "/horoscope/chart-image",
    planetPosition: "/horoscope/planet-position",
  },
} as const;
