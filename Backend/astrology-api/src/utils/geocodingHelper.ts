import axios from "axios";
import { logger } from "./logger";

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Fetches coordinates for a given city and country.
 * Uses Nominatim (OpenStreetMap) for free geocoding.
 */
export const getCoordinates = async (
  city: string,
  country: string
): Promise<GeoCoordinates | null> => {
  try {
    const query = `${city}, ${country}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Astrology-API/1.0",
      },
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
    }

    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown geocoding error";
    logger.error(`Geocoding failed for ${city}, ${country}: ${message}`);
    return null;
  }
};
