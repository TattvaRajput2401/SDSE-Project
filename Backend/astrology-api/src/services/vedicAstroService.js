const axios = require("axios");

const cacheService = require("./cacheService");
const vedicConfig = require("../config/vedicAstroConfig");

class VedicAstroService {
  constructor() {
    this.client = axios.create({
      baseURL: vedicConfig.baseURL,
      timeout: vedicConfig.timeout,
    });
  }

  async callEndpoint(endpoint, params, cacheKey, ttlSeconds = 60 * 60 * 24 * 30) {
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(endpoint, {
      params: {
        ...params,
        api_key: vedicConfig.apiKey,
        lang: "en",
      },
    });

    await cacheService.set(cacheKey, response.data, ttlSeconds);
    return response.data;
  }

  async checkManglikDosh({ dob, tob, lat, lon, tz }) {
    return this.callEndpoint(
      vedicConfig.endpoints.manglikDosh,
      { dob, tob, lat, lon, tz },
      `manglik:${dob}:${tob}:${lat}:${lon}:${tz}`
    );
  }

  async checkKalsarpDosh({ dob, tob, lat, lon, tz }) {
    return this.callEndpoint(
      vedicConfig.endpoints.kalsarpDosh,
      { dob, tob, lat, lon, tz },
      `kalsarp:${dob}:${tob}:${lat}:${lon}:${tz}`
    );
  }

  async checkSadesati({ dob, tob, lat, lon, tz }) {
    return this.callEndpoint(
      vedicConfig.endpoints.sadesati,
      { dob, tob, lat, lon, tz },
      `sadesati:${dob}:${tob}:${lat}:${lon}:${tz}`
    );
  }

  async generateBirthChart({ dob, tob, lat, lon, tz }) {
    return this.callEndpoint(
      vedicConfig.endpoints.birthChart,
      { dob, tob, lat, lon, tz },
      `birthchart:${dob}:${tob}:${lat}:${lon}:${tz}`
    );
  }
}

module.exports = new VedicAstroService();
