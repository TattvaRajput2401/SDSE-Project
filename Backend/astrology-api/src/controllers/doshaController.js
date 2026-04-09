const DoshaReport = require("../models/DoshaReportModel");
const UserProfile = require("../models/UserProfileModel");
const doshaService = require("../services/doshaService");
const vedicAstroService = require("../services/vedicAstroService");

const DOSHA_TYPES = ["manglik", "kalsarp", "sadesati", "pitradosh", "nadi"];

const resolveDoshaRequest = async (doshaType, params) => {
  switch (doshaType) {
    case "manglik":
      return vedicAstroService.checkManglikDosh(params);
    case "kalsarp":
      return vedicAstroService.checkKalsarpDosh(params);
    case "sadesati":
      return vedicAstroService.checkSadesati(params);
    case "pitradosh":
      return vedicAstroService.callEndpoint(
        "/dosha/pitra-dosh",
        params,
        `pitradosh:${params.dob}:${params.tob}:${params.lat}:${params.lon}:${params.tz}`
      );
    case "nadi":
      return vedicAstroService.callEndpoint(
        "/dosha/nadi-dosh",
        params,
        `nadi:${params.dob}:${params.tob}:${params.lat}:${params.lon}:${params.tz}`
      );
    default:
      throw new Error("Invalid dosha type");
  }
};

exports.getDoshaTypes = async (req, res) => {
  return res.json({ success: true, data: DOSHA_TYPES });
};

exports.searchDoshas = async (req, res, next) => {
  try {
    const {
      type,
      severity,
      isPresent,
      page = 1,
      limit = 10,
      sort = "-createdAt",
      search,
    } = req.query;

    const filter = { userId: req.user._id };
    if (type) filter.doshaType = type;
    if (severity) filter.severity = severity;
    if (isPresent !== undefined) filter.isPresent = isPresent === "true";

    const skip = (Number(page) - 1) * Number(limit);

    if (search) {
      const all = await DoshaReport.find(filter)
        .populate("profileId", "personalInfo")
        .sort(sort);

      const filtered = all.filter((item) =>
        item.profileId?.personalInfo?.name
          ?.toLowerCase()
          .includes(String(search).toLowerCase())
      );

      return res.json({
        success: true,
        total: filtered.length,
        page: Number(page),
        limit: Number(limit),
        data: filtered.slice(skip, skip + Number(limit)).map(doshaService.formatReport),
      });
    }

    const [items, total] = await Promise.all([
      DoshaReport.find(filter)
        .populate("profileId", "personalInfo")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      DoshaReport.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: items.map(doshaService.formatReport),
    });
  } catch (error) {
    return next(error);
  }
};

exports.checkDosha = async (req, res, next) => {
  try {
    const { doshaType, profileId } = req.body;

    const profileFilter = {
      userId: req.user._id,
      isDeleted: false,
    };
    if (profileId) profileFilter._id = profileId;

    const profile = await UserProfile.findOne(profileFilter);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const params = {
      dob: doshaService.formatDate(profile.personalInfo.dateOfBirth),
      tob: profile.personalInfo.timeOfBirth,
      lat: profile.personalInfo.placeOfBirth.coordinates.latitude,
      lon: profile.personalInfo.placeOfBirth.coordinates.longitude,
      tz: profile.timezone,
    };

    const reportData = await resolveDoshaRequest(doshaType, params);
    const isPresent = Boolean(reportData?.is_present ?? reportData?.present ?? false);
    const severity = doshaService.calculateSeverity(reportData);
    const remedies = Array.isArray(reportData?.remedies) ? reportData.remedies : [];

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const saved = await DoshaReport.create({
      userId: req.user._id,
      profileId: profile._id,
      doshaType,
      reportData,
      isPresent,
      severity,
      remedies,
      cachedAt: new Date(),
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      message: "Dosha report generated successfully",
      data: doshaService.formatReport(saved),
    });
  } catch (error) {
    return next(error);
  }
};

exports.getDoshaReport = async (req, res, next) => {
  try {
    const report = await DoshaReport.findById(req.params.doshaId).populate(
      "profileId",
      "personalInfo"
    );

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    if (req.user.role !== "admin" && String(report.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Insufficient access" });
    }

    return res.json({ success: true, data: doshaService.formatReport(report) });
  } catch (error) {
    return next(error);
  }
};

exports.deleteDoshaReport = async (req, res, next) => {
  try {
    const report = await DoshaReport.findById(req.params.doshaId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    if (req.user.role !== "admin" && String(report.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Insufficient access" });
    }

    await report.deleteOne();
    return res.json({ success: true, message: "Dosha report deleted" });
  } catch (error) {
    return next(error);
  }
};
