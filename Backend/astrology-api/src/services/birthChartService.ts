import { BaseService } from "../core/BaseService";
import { formatDateForVedic, isValidTime24h } from "../utils/dateTimeHelper";

export class BirthChartService extends BaseService {
  protected readonly serviceName = "BirthChartService";

  public formatDate(date: Date | string): string {
    return formatDateForVedic(date);
  }

  public isValidTimeFormat(time: string): boolean {
    return isValidTime24h(time);
  }

  public convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if ((modifier || "").toUpperCase() === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }
    return `${hours.padStart(2, "0")}:${minutes}`;
  }
}

export const birthChartService = new BirthChartService();
