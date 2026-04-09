const BirthChart = require("../models/BirthChartModel");
const DoshaReport = require("../models/DoshaReportModel");
const UserProfile = require("../models/UserProfileModel");

const canAccessUser = (reqUser, targetUserId) =>
  reqUser.role === "admin" || String(reqUser._id) === String(targetUserId);

exports.createProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const existingProfile = await UserProfile.findOne({ userId, isDeleted: false });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Profile already exists. Use update endpoint.",
      });
    }

    const profile = await UserProfile.create({
      userId,
      personalInfo: {
        name: req.body.name,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        timeOfBirth: req.body.timeOfBirth,
        placeOfBirth: {
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
          coordinates: {
            latitude: req.body.latitude,
            longitude: req.body.longitude,
          },
        },
      },
      timezone: req.body.timezone || "+5.5",
    });

    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId || req.user._id;
    if (!canAccessUser(req.user, targetUserId)) {
      return res.status(403).json({ success: false, message: "Insufficient access" });
    }

    const profile = await UserProfile.findOne({ userId: targetUserId, isDeleted: false });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    return res.json({ success: true, data: profile });
  } catch (error) {
    return next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId || req.user._id;
    if (!canAccessUser(req.user, targetUserId)) {
      return res.status(403).json({ success: false, message: "Insufficient access" });
    }

    const profile = await UserProfile.findOne({ userId: targetUserId, isDeleted: false });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const updates = req.body;
    if (updates.name !== undefined) profile.personalInfo.name = updates.name;
    if (updates.gender !== undefined) profile.personalInfo.gender = updates.gender;
    if (updates.dateOfBirth !== undefined)
      profile.personalInfo.dateOfBirth = updates.dateOfBirth;
    if (updates.timeOfBirth !== undefined)
      profile.personalInfo.timeOfBirth = updates.timeOfBirth;
    if (updates.city !== undefined) profile.personalInfo.placeOfBirth.city = updates.city;
    if (updates.state !== undefined) profile.personalInfo.placeOfBirth.state = updates.state;
    if (updates.country !== undefined)
      profile.personalInfo.placeOfBirth.country = updates.country;
    if (updates.latitude !== undefined)
      profile.personalInfo.placeOfBirth.coordinates.latitude = updates.latitude;
    if (updates.longitude !== undefined)
      profile.personalInfo.placeOfBirth.coordinates.longitude = updates.longitude;
    if (updates.timezone !== undefined) profile.timezone = updates.timezone;

    await profile.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId || req.user._id;
    if (!canAccessUser(req.user, targetUserId)) {
      return res.status(403).json({ success: false, message: "Insufficient access" });
    }

    const profile = await UserProfile.findOne({ userId: targetUserId, isDeleted: false });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    profile.isDeleted = true;
    profile.deletedAt = new Date();
    await profile.save();

    await BirthChart.updateMany({ profileId: profile._id }, { isDeleted: true });
    await DoshaReport.deleteMany({ profileId: profile._id });

    return res.json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
