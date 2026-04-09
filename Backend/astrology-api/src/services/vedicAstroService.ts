import axios, { AxiosInstance } from "axios";
import { vedicAstroConfig } from "../config/vedicAstroConfig";
import { BaseService } from "../core/BaseService";
import { VedicParams } from "../types/vedic";
import { cacheService } from "./cacheService";
import { IAstroService } from "./interfaces/IAstroService";

export class VedicAstroService extends BaseService implements IAstroService {
  protected readonly serviceName = "VedicAstroService";
  private readonly client: AxiosInstance;

  constructor() {
    super();
    this.client = axios.create({
      baseURL: vedicAstroConfig.baseURL,
      timeout: vedicAstroConfig.timeout,
    });
  }

  public async callEndpoint(
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

  public checkManglikDosh(params: VedicParams): Promise<Record<string, unknown>> {
    return this.callEndpoint(
      vedicAstroConfig.endpoints.manglikDosh,
      { ...params },
      `manglik:${params.dob}:${params.tob}:${params.lat}:${params.lon}:${params.tz}`
    );
  }

  public checkKalsarpDosh(params: VedicParams): Promise<Record<string, unknown>> {
    return this.callEndpoint(
      vedicAstroConfig.endpoints.kalsarpDosh,
      { ...params },
      `kalsarp:${params.dob}:${params.tob}:${params.lat}:${params.lon}:${params.tz}`
    );
  }

  public checkSadesati(params: VedicParams): Promise<Record<string, unknown>> {
    return this.callEndpoint(
      vedicAstroConfig.endpoints.sadesati,
      { ...params },
      `sadesati:${params.dob}:${params.tob}:${params.lat}:${params.lon}:${params.tz}`
    );
  }

  public generateBirthChart(params: VedicParams): Promise<Record<string, unknown>> {
    return this.callEndpoint(
      vedicAstroConfig.endpoints.birthChart,
      { ...params },
      `birthchart:${params.dob}:${params.tob}:${params.lat}:${params.lon}:${params.tz}`
    );
  }
}

export const vedicAstroService = new VedicAstroService();
