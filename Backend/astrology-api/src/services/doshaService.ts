import { BaseService } from "../core/BaseService";
import { formatDateForVedic } from "../utils/dateTimeHelper";

export class DoshaService extends BaseService {
  protected readonly serviceName = "DoshaService";

  public formatDate(date: Date | string): string {
    return formatDateForVedic(date);
  }

  public calculateSeverity(apiResponse: Record<string, unknown>): "low" | "medium" | "high" {
    const isPresent = Boolean(apiResponse.is_present ?? apiResponse.present);
    if (!isPresent) return "low";

    const severity = String(apiResponse.severity || "").toLowerCase();
    if (severity === "low" || severity === "medium" || severity === "high") {
      return severity;
    }

    const percentage = Number(apiResponse.percentage);
    if (!Number.isNaN(percentage)) {
      if (percentage > 70) return "high";
      if (percentage > 40) return "medium";
      return "low";
    }

    return "medium";
  }

  public formatReport(report: {
    _id: unknown;
    doshaType: string;
    isPresent: boolean;
    severity: string;
    reportData?: Record<string, unknown>;
    remedies?: string[];
    cachedAt?: Date;
    profileId?: { personalInfo?: { name?: string; dateOfBirth?: Date } };
  }): Record<string, unknown> {
    return {
      id: report._id,
      doshaType: report.doshaType,
      isPresent: report.isPresent,
      severity: report.severity,
      summary: String(report.reportData?.summary || "No summary available"),
      remedies: report.remedies || [],
      cachedAt: report.cachedAt,
      profile: report.profileId
        ? {
            name: report.profileId.personalInfo?.name,
            dateOfBirth: report.profileId.personalInfo?.dateOfBirth,
          }
        : null,
    };
  }
}

export const doshaService = new DoshaService();
