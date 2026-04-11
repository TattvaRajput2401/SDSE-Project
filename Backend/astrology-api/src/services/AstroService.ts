import axios, { AxiosInstance } from "axios";
import { vedicAstroConfig } from "../config/vedicAstroConfig";
import { BaseService } from "../core/BaseService";
import { VedicParams } from "../types/vedic";
import { cacheService } from "./cacheService";
import { IAstroService } from "./interfaces/IAstroService";

export class AstroService extends BaseService implements IAstroService {
  protected readonly serviceName = "AstroService";
  private readonly client: AxiosInstance;

  constructor() {
    super();
    this.client = axios.create({
      baseURL: vedicAstroConfig.baseURL,
      timeout: vedicAstroConfig.timeout,
    });
  }

  protected async callEndpoint(
    endpoint: string,
    params: Record<string, unknown>,
    cacheKey: string,
    ttlSeconds = 60 * 60 * 24 * 30
  ): Promise<Record<string, unknown>> {
    const cached = await cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const response = await this.client.get(endpoint, {
      params: {
        ...params,
        api_key: vedicAstroConfig.apiKey,
        lang: "en",
      },
    });

    await cacheService.set(cacheKey, response.data, ttlSeconds);
    return response.data as Record<string, unknown>;
  }

  public fetchManglikDosh(params: VedicParams): Promise<Record<string, unknown>> {
    return this.callEndpoint(
      vedicAstroConfig.endpoints.manglikDosh,
      { ...params },
      `manglik:${params.dob}:${params.tob}:${params.lat}:${params.lon}:${params.tz}`
    );
  }

  public fetchOtherdosha(params: VedicParams, doshaType: string): Promise<Record<string, unknown>> {
    let endpoint = "";
    switch (doshaType) {
      case "kalsarp":
        endpoint = vedicAstroConfig.endpoints.kalsarpDosh;
        break;
      case "sadesati":
        endpoint = vedicAstroConfig.endpoints.sadesati;
        break;
      case "pitradosh":
        endpoint = vedicAstroConfig.endpoints.pitradosh;
        break;
      case "nadi":
        endpoint = vedicAstroConfig.endpoints.nadiDosh;
        break;
      default:
        throw new Error("Invalid dosha type for fetchOtherdosha");
    }

    return this.callEndpoint(
      endpoint,
      { ...params },
      `${doshaType}:${params.dob}:${params.tob}:${params.lat}:${params.lon}:${params.tz}`
    );
  }

  public fetchBirthChart(params: VedicParams): Promise<Record<string, unknown>> {
    return this.callEndpoint(
      vedicAstroConfig.endpoints.birthChart,
      { ...params },
      `birthchart:${params.dob}:${params.tob}:${params.lat}:${params.lon}:${params.tz}`
    );
  }
}

export const astroService = new AstroService();
