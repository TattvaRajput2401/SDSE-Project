import { VedicParams } from "../../types/vedic";

export interface IAstroService {
  fetchManglikDosh(params: VedicParams): Promise<Record<string, unknown>>;
  fetchOtherdosha(params: VedicParams, doshaType: string): Promise<Record<string, unknown>>;
  fetchBirthChart(params: VedicParams): Promise<Record<string, unknown>>;
}
