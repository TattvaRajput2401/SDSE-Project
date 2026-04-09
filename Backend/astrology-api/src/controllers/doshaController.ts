import { Request, Response } from "express";
import { BaseController } from "../core/BaseController";
import { DoshaReportModel } from "../models/DoshaReportModel";
import { UserProfileModel } from "../models/UserProfileModel";
import { doshaService } from "../services/doshaService";
import { vedicAstroConfig } from "../config/vedicAstroConfig";
import { vedicAstroService } from "../services/vedicAstroService";
import { DoshaType } from "../types/vedic";

const DOSHA_TYPES: DoshaType[] = ["manglik", "kalsarp", "sadesati", "pitradosh", "nadi"];

class DoshaController extends BaseController {
  private async resolveDoshaRequest(
    doshaType: DoshaType,
    params: { dob: string; tob: string; lat: number; lon: number; tz: string }
  ): Promise<Record<string, unknown>> {
    switch (doshaType) {
      case "manglik":
        return vedicAstroService.checkManglikDosh(params);
      case "kalsarp":
        return vedicAstroService.checkKalsarpDosh(params);
      case "sadesati":
        return vedicAstroService.checkSadesati(params);
      case "pitradosh":
        return vedicAstroService.callEndpoint(
          vedicAstroConfig.endpoints.pitradosh,
          params,
          `pitradosh:${params.dob}:${params.tob}:${params.lat}:${params.lon}:${params.tz}`
        );
      case "nadi":
        return vedicAstroService.callEndpoint(
          vedicAstroConfig.endpoints.nadiDosh,
          params,
          `nadi:${params.dob}:${params.tob}:${params.lat}:${params.lon}:${params.tz}`
        );
      default:
        throw new Error("Invalid dosha type");
    }
  }

  public getDoshaTypes = this.asyncHandler(async (_req: Request, res: Response) => {
    return this.ok(res, DOSHA_TYPES);
  });

  public searchDoshas = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return this.fail(res, 401, "Unauthorized");

    const { type, severity, isPresent, page = "1", limit = "10", sort = "-createdAt", search } =
      req.query as Record<string, string>;

    const filter: Record<string, unknown> = { userId };
    if (type) filter.doshaType = type;
    if (severity) filter.severity = severity;
    if (isPresent !== undefined) filter.isPresent = isPresent === "true";

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    if (search) {
      const all = await DoshaReportModel.find(filter).populate("profileId", "personalInfo").sort(sort);
      const filtered = all.filter((item: any) =>
        item.profileId?.personalInfo?.name?.toLowerCase().includes(search.toLowerCase())
      );

      return res.json({
        success: true,
        total: filtered.length,
        page: pageNumber,
        limit: limitNumber,
        data: filtered.slice(skip, skip + limitNumber).map((r) => doshaService.formatReport(r as any)),
      });
    }

    const [items, total] = await Promise.all([
      DoshaReportModel.find(filter)
        .populate("profileId", "personalInfo")
        .sort(sort)
        .skip(skip)
        .limit(limitNumber),
      DoshaReportModel.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      total,
      page: pageNumber,
      limit: limitNumber,
      data: items.map((r) => doshaService.formatReport(r as any)),
    });
  });

  public checkDosha = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return this.fail(res, 401, "Unauthorized");

    const { doshaType, profileId } = req.body as { doshaType: DoshaType; profileId?: string };

    const profileFilter: Record<string, unknown> = { userId, isDeleted: false };
    if (profileId) profileFilter._id = profileId;

    const profile = await UserProfileModel.findOne(profileFilter);
    if (!profile) return this.fail(res, 404, "Profile not found");

    const params = {
      dob: doshaService.formatDate(profile.personalInfo.dateOfBirth),
      tob: profile.personalInfo.timeOfBirth,
      lat: profile.personalInfo.placeOfBirth.coordinates.latitude,
      lon: profile.personalInfo.placeOfBirth.coordinates.longitude,
      tz: profile.timezone,
    };

    const reportData = await this.resolveDoshaRequest(doshaType, params);
    const isPresent = Boolean((reportData.is_present ?? reportData.present) as boolean);
    const severity = doshaService.calculateSeverity(reportData);
    const remedies = Array.isArray(reportData.remedies)
      ? (reportData.remedies as string[])
      : [];

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const saved = await DoshaReportModel.create({
      userId,
      profileId: profile._id,
      doshaType,
      reportData,
      isPresent,
      severity,
      remedies,
      cachedAt: new Date(),
      expiresAt,
    });

    return this.created(res, doshaService.formatReport(saved as any), "Dosha report generated successfully");
  });

  public getDoshaReport = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const report = await DoshaReportModel.findById(req.params.doshaId).populate("profileId", "personalInfo");
    if (!report) return this.fail(res, 404, "Report not found");

    if (reqUser.role !== "admin" && String(report.userId) !== String(reqUser._id)) {
      return this.fail(res, 403, "Insufficient access");
    }

    return this.ok(res, doshaService.formatReport(report as any));
  });

  public deleteDoshaReport = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const report = await DoshaReportModel.findById(req.params.doshaId);
    if (!report) return this.fail(res, 404, "Report not found");

    if (reqUser.role !== "admin" && String(report.userId) !== String(reqUser._id)) {
      return this.fail(res, 403, "Insufficient access");
    }

    await report.deleteOne();
    return this.ok(res, null, "Dosha report deleted");
  });
}

export const doshaController = new DoshaController();
