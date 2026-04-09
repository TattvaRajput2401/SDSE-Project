const { formatDateForVedic } = require("../utils/dateTimeHelper");

class DoshaService {
  formatDate(date) {
    return formatDateForVedic(date);
  }

  calculateSeverity(apiResponse) {
    if (!apiResponse?.is_present && !apiResponse?.present) {
      return "low";
    }

    if (apiResponse?.severity) {
      const sev = String(apiResponse.severity).toLowerCase();
      if (["low", "medium", "high"].includes(sev)) return sev;
    }

    const percentage = Number(apiResponse?.percentage);
    if (!Number.isNaN(percentage)) {
      if (percentage > 70) return "high";
      if (percentage > 40) return "medium";
      return "low";
    }

    return "medium";
  }

  formatReport(report) {
    return {
      id: report._id,
      doshaType: report.doshaType,
      isPresent: report.isPresent,
      severity: report.severity,
      summary: report.reportData?.summary || "No summary available",
      remedies: report.remedies,
      cachedAt: report.cachedAt,
      profile: report.profileId
        ? {
            name: report.profileId?.personalInfo?.name,
            dateOfBirth: report.profileId?.personalInfo?.dateOfBirth,
          }
        : null,
    };
  }
}

module.exports = new DoshaService();
