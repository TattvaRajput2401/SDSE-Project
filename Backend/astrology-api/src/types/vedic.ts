export type DoshaType = "manglik" | "kalsarp" | "sadesati" | "pitradosh" | "nadi";

export interface VedicParams {
  dob: string;
  tob: string;
  lat: number;
  lon: number;
  tz: string;
}
