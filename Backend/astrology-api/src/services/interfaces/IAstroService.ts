import { VedicParams } from "../../types/vedic";

export interface IAstroService {
  checkManglikDosh(params: VedicParams): Promise<Record<string, unknown>>;
  checkKalsarpDosh(params: VedicParams): Promise<Record<string, unknown>>;
  checkSadesati(params: VedicParams): Promise<Record<string, unknown>>;
  generateBirthChart(params: VedicParams): Promise<Record<string, unknown>>;
  callEndpoint(
    endpoint: string,
    params: Record<string, unknown>,
    cacheKey: string,
    ttlSeconds?: number
  ): Promise<Record<string, unknown>>;
}
