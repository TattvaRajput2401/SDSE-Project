import { BaseService } from "../core/BaseService";
import { IUserProfile, UserProfileModel } from "../models/UserProfileModel";

export class ProfileService extends BaseService {
  protected readonly serviceName = "ProfileService";

  public async getProfileByUserId(userId: string): Promise<IUserProfile | null> {
    return UserProfileModel.findOne({ userId, isDeleted: false });
  }

  public async createProfile(profileData: Partial<IUserProfile>): Promise<IUserProfile> {
    return UserProfileModel.create(profileData);
  }

  public async updateProfile(profile: IUserProfile, updates: Record<string, any>): Promise<IUserProfile> {
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

    return profile.save();
  }

  public async softDeleteProfile(profile: IUserProfile): Promise<void> {
    profile.isDeleted = true;
    profile.deletedAt = new Date();
    await profile.save();
  }
}

export const profileService = new ProfileService();
