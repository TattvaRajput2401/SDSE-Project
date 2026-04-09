import { Request, Response } from "express";
import { BaseController } from "../core/BaseController";
import { BirthChartModel } from "../models/BirthChartModel";
import { DoshaReportModel } from "../models/DoshaReportModel";
import { UserProfileModel } from "../models/UserProfileModel";

class ProfileController extends BaseController {
  private canAccessUser(reqUserId: string, reqUserRole: string, targetUserId: string): boolean {
    return reqUserRole === "admin" || String(reqUserId) === String(targetUserId);
  }

  public createProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return this.fail(res, 401, "Unauthorized");

    const existingProfile = await UserProfileModel.findOne({ userId, isDeleted: false });
    if (existingProfile) return this.fail(res, 409, "Profile already exists. Use update endpoint.");

    const profile = await UserProfileModel.create({
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
          coordinates: { latitude: req.body.latitude, longitude: req.body.longitude },
        },
      },
      timezone: req.body.timezone || "+5.5",
    });

    return this.created(res, profile, "Profile created successfully");
  });

  public getProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const targetUserId = String(req.params.userId || reqUser._id);
    if (!this.canAccessUser(reqUser._id, reqUser.role, targetUserId)) {
      return this.fail(res, 403, "Insufficient access");
    }

    const profile = await UserProfileModel.findOne({ userId: targetUserId, isDeleted: false });
    if (!profile) return this.fail(res, 404, "Profile not found");

    return this.ok(res, profile);
  });

  public updateProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const targetUserId = String(req.params.userId || reqUser._id);
    if (!this.canAccessUser(reqUser._id, reqUser.role, targetUserId)) {
      return this.fail(res, 403, "Insufficient access");
    }

    const profile = await UserProfileModel.findOne({ userId: targetUserId, isDeleted: false });
    if (!profile) return this.fail(res, 404, "Profile not found");

    const updates = req.body as Record<string, unknown>;
    if (updates.name !== undefined) profile.personalInfo.name = String(updates.name);
    if (updates.gender !== undefined)
      profile.personalInfo.gender = updates.gender as "male" | "female" | "other";
    if (updates.dateOfBirth !== undefined) profile.personalInfo.dateOfBirth = new Date(String(updates.dateOfBirth));
    if (updates.timeOfBirth !== undefined) profile.personalInfo.timeOfBirth = String(updates.timeOfBirth);
    if (updates.city !== undefined) profile.personalInfo.placeOfBirth.city = String(updates.city);
    if (updates.state !== undefined) profile.personalInfo.placeOfBirth.state = String(updates.state);
    if (updates.country !== undefined) profile.personalInfo.placeOfBirth.country = String(updates.country);
    if (updates.latitude !== undefined)
      profile.personalInfo.placeOfBirth.coordinates.latitude = Number(updates.latitude);
    if (updates.longitude !== undefined)
      profile.personalInfo.placeOfBirth.coordinates.longitude = Number(updates.longitude);
    if (updates.timezone !== undefined) profile.timezone = String(updates.timezone);

    await profile.save();
    return this.ok(res, profile, "Profile updated successfully");
  });

  public deleteProfile = this.asyncHandler(async (req: Request, res: Response) => {
    const reqUser = req.user;
    if (!reqUser) return this.fail(res, 401, "Unauthorized");

    const targetUserId = String(req.params.userId || reqUser._id);
    if (!this.canAccessUser(reqUser._id, reqUser.role, targetUserId)) {
      return this.fail(res, 403, "Insufficient access");
    }

    const profile = await UserProfileModel.findOne({ userId: targetUserId, isDeleted: false });
    if (!profile) return this.fail(res, 404, "Profile not found");

    profile.isDeleted = true;
    profile.deletedAt = new Date();
    await profile.save();

    await BirthChartModel.updateMany({ profileId: profile._id }, { isDeleted: true });
    await DoshaReportModel.deleteMany({ profileId: profile._id });

    return this.ok(res, null, "Profile deleted successfully");
  });
}

export const profileController = new ProfileController();
