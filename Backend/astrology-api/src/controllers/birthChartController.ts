import { Request, Response } from "express";
import { BaseController } from "../core/BaseController";
import { BirthChartModel } from "../models/BirthChartModel";
import { UserProfileModel } from "../models/UserProfileModel";
import { birthChartService } from "../services/birthChartService";
import { vedicAstroService } from "../services/vedicAstroService";

class BirthChartController extends BaseController {
  private buildChartParamsFromProfile(profile: any) {
    return {
      dob: birthChartService.formatDate(profile.personalInfo.dateOfBirth),
      tob: profile.personalInfo.timeOfBirth,
      lat: profile.personalInfo.placeOfBirth.coordinates.latitude,
      lon: profile.personalInfo.placeOfBirth.coordinates.longitude,
      tz: profile.timezone,
    };
  }

  public generateChart = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return this.fail(res, 401, "Unauthorized");

    const profile = await UserProfileModel.findOne({ userId, isDeleted: false });
    if (!profile) return this.fail(res, 404, "Please create your profile first");

    const chartData = await vedicAstroService.generateBirthChart(this.buildChartParamsFromProfile(profile));

    const chart = await BirthChartModel.create({
      userId,
      profileId: profile._id,
      chartName: req.body.chartName || "My Birth Chart",
      chartData,
      chartImage: String((chartData.svg_chart || chartData.chart_url || "") as string),
      generatedAt: new Date(),
    });

    return this.created(res, chart, "Birth chart generated successfully");
  });

  public getUserCharts = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const targetUserId = req.params.userId || reqUser._id;
    if (reqUser.role !== "admin" && String(targetUserId) !== String(reqUser._id)) {
      return this.fail(res, 403, "Insufficient access");
    }

    const charts = await BirthChartModel.find({ userId: targetUserId, isDeleted: false }).sort({
      createdAt: -1,
    });

    return res.json({ success: true, count: charts.length, data: charts });
  });

  public getChartById = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const chart = await BirthChartModel.findById(req.params.chartId);
    if (!chart || chart.isDeleted) return this.fail(res, 404, "Chart not found");

    if (reqUser.role !== "admin" && String(chart.userId) !== String(reqUser._id)) {
      return this.fail(res, 403, "Insufficient access");
    }

    return this.ok(res, chart);
  });

  public updateChart = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const chart = await BirthChartModel.findById(req.params.chartId);
    if (!chart || chart.isDeleted) return this.fail(res, 404, "Chart not found");

    if (reqUser.role !== "admin" && String(chart.userId) !== String(reqUser._id)) {
      return this.fail(res, 403, "Insufficient access");
    }

    chart.chartName = req.body.chartName || chart.chartName;
    await chart.save();

    return this.ok(res, chart, "Chart updated");
  });

  public updateBirthDetails = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const chart = await BirthChartModel.findById(req.params.chartId);
    if (!chart || chart.isDeleted) return this.fail(res, 404, "Chart not found");

    if (reqUser.role !== "admin" && String(chart.userId) !== String(reqUser._id)) {
      return this.fail(res, 403, "Insufficient access");
    }

    const profile = await UserProfileModel.findById(chart.profileId);
    if (!profile || profile.isDeleted) return this.fail(res, 404, "Profile not found");

    if (req.body.dateOfBirth !== undefined) profile.personalInfo.dateOfBirth = new Date(req.body.dateOfBirth);
    if (req.body.timeOfBirth !== undefined) profile.personalInfo.timeOfBirth = req.body.timeOfBirth;
    if (req.body.latitude !== undefined) profile.personalInfo.placeOfBirth.coordinates.latitude = req.body.latitude;
    if (req.body.longitude !== undefined)
      profile.personalInfo.placeOfBirth.coordinates.longitude = req.body.longitude;
    await profile.save();

    const chartData = await vedicAstroService.generateBirthChart(this.buildChartParamsFromProfile(profile));
    chart.chartData = chartData;
    chart.chartImage = String((chartData.svg_chart || chartData.chart_url || "") as string);
    chart.generatedAt = new Date();
    await chart.save();

    return this.ok(res, chart, "Chart regenerated");
  });

  public deleteChart = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const chart = await BirthChartModel.findById(req.params.chartId);
    if (!chart || chart.isDeleted) return this.fail(res, 404, "Chart not found");

    if (reqUser.role !== "admin" && String(chart.userId) !== String(reqUser._id)) {
      return this.fail(res, 403, "Insufficient access");
    }

    chart.isDeleted = true;
    await chart.save();
    return this.ok(res, null, "Chart deleted successfully");
  });
}

export const birthChartController = new BirthChartController();
