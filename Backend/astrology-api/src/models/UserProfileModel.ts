import mongoose, { Document, Schema, Types } from "mongoose";

interface IPlaceOfBirth {
  city: string;
  state?: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface IPersonalInfo {
  name: string;
  gender: "male" | "female" | "other";
  dateOfBirth: Date;
  timeOfBirth: string;
  placeOfBirth: IPlaceOfBirth;
}

export interface IUserProfile extends Document {
  userId: Types.ObjectId;
  personalInfo: IPersonalInfo;
  timezone: string;
  isDeleted: boolean;
  deletedAt?: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    personalInfo: {
      name: { type: String, required: true, trim: true },
      gender: { type: String, enum: ["male", "female", "other"], required: true },
      dateOfBirth: { type: Date, required: true },
      timeOfBirth: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
      },
      placeOfBirth: {
        city: { type: String, required: true },
        state: { type: String },
        country: { type: String, required: true },
        coordinates: {
          latitude: { type: Number, required: true },
          longitude: { type: Number, required: true },
        },
      },
    },
    timezone: { type: String, required: true, default: "+5.5" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

userProfileSchema.index({ userId: 1 });

export const UserProfileModel = mongoose.model<IUserProfile>("UserProfile", userProfileSchema);
