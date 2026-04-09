const BirthChart = require("../models/BirthChartModel");
const UserProfile = require("../models/UserProfileModel");
const birthChartService = require("../services/birthChartService");
const vedicAstroService = require("../services/vedicAstroService");

const buildChartParamsFromProfile = (profile) => ({
  dob: birthChartService.formatDate(profile.personalInfo.dateOfBirth),
  tob: profile.personalInfo.timeOfBirth,
  lat: profile.personalInfo.placeOfBirth.coordinates.latitude,
  lon: profile.personalInfo.placeOfBirth.coordinates.longitude,
  tz: profile.timezone,
});

exports.generateChart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await UserProfile.findOne({ userId, isDeleted: false });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Please create your profile first" });
    }

    const chartData = await vedicAstroService.generateBirthChart(
      buildChartParamsFromProfile(profile)
    );

    const chart = await BirthChart.create({
      userId,
      profileId: profile._id,
      chartName: req.body.chartName || "My Birth Chart",
      chartData,
      chartImage: chartData.svg_chart || chartData.chart_url,
      generatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Birth chart generated successfully",
      data: chart,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getUserCharts = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId || req.user._id;
    if (req.user.role !== "admin" && String(targetUserId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Insufficient access" });
    }

    const charts = await BirthChart.find({
      userId: targetUserId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return res.json({ success: true, count: charts.length, data: charts });
  } catch (error) {
    return next(error);
  }
};

exports.getChartById = async (req, res, next) => {
  try {
    const chart = await BirthChart.findById(req.params.chartId);
    if (!chart || chart.isDeleted) {
      return res.status(404).json({ success: false, message: "Chart not found" });
    }

    if (req.user.role !== "admin" && String(chart.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Insufficient access" });
    }

    return res.json({ success: true, data: chart });
  } catch (error) {
    return next(error);
  }
};

exports.updateChart = async (req, res, next) => {
  try {
    const chart = await BirthChart.findById(req.params.chartId);
    if (!chart || chart.isDeleted) {
      return res.status(404).json({ success: false, message: "Chart not found" });
    }

    if (req.user.role !== "admin" && String(chart.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Insufficient access" });
    }

    chart.chartName = req.body.chartName || chart.chartName;
    await chart.save();

    return res.json({ success: true, message: "Chart updated", data: chart });
  } catch (error) {
    return next(error);
  }
};

exports.updateBirthDetails = async (req, res, next) => {
  try {
    const chart = await BirthChart.findById(req.params.chartId);
    if (!chart || chart.isDeleted) {
      return res.status(404).json({ success: false, message: "Chart not found" });
    }

    if (req.user.role !== "admin" && String(chart.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Insufficient access" });
    }

    const profile = await UserProfile.findById(chart.profileId);
    if (!profile || profile.isDeleted) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (req.body.dateOfBirth !== undefined) {
      profile.personalInfo.dateOfBirth = req.body.dateOfBirth;
    }
    if (req.body.timeOfBirth !== undefined) {
      profile.personalInfo.timeOfBirth = req.body.timeOfBirth;
    }
    if (req.body.latitude !== undefined) {
      profile.personalInfo.placeOfBirth.coordinates.latitude = req.body.latitude;
    }
    if (req.body.longitude !== undefined) {
      profile.personalInfo.placeOfBirth.coordinates.longitude = req.body.longitude;
    }
    await profile.save();

    const chartData = await vedicAstroService.generateBirthChart(
      buildChartParamsFromProfile(profile)
    );

    chart.chartData = chartData;
    chart.chartImage = chartData.svg_chart || chartData.chart_url;
    chart.generatedAt = new Date();
    await chart.save();

    return res.json({ success: true, message: "Chart regenerated", data: chart });
  } catch (error) {
    return next(error);
  }
};

exports.deleteChart = async (req, res, next) => {
  try {
    const chart = await BirthChart.findById(req.params.chartId);
    if (!chart || chart.isDeleted) {
      return res.status(404).json({ success: false, message: "Chart not found" });
    }

    if (req.user.role !== "admin" && String(chart.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Insufficient access" });
    }

    chart.isDeleted = true;
    await chart.save();

    return res.json({ success: true, message: "Chart deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
