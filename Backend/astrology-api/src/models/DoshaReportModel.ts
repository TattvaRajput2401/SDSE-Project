import mongoose, { Document, Schema, Types } from "mongoose";
import { DoshaType } from "../types/vedic";

export interface IDoshaReport extends Document {
  userId: Types.ObjectId;
  profileId: Types.ObjectId;
  doshaType: DoshaType;
  reportData: Record<string, unknown>;
  isPresent: boolean;
  severity: "low" | "medium" | "high";
  remedies: string[];
  cachedAt: Date;
  expiresAt: Date;
}

const doshaReportSchema = new Schema<IDoshaReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    profileId: { type: Schema.Types.ObjectId, ref: "UserProfile", required: true },
    doshaType: {
      type: String,
      enum: ["manglik", "kalsarp", "sadesati", "pitradosh", "nadi"],
      required: true,
    },
    reportData: { type: Schema.Types.Mixed, required: true },
    isPresent: { type: Boolean, default: false },
    severity: { type: String, enum: ["low", "medium", "high"], default: "low" },
    remedies: { type: [String], default: [] },
    cachedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

doshaReportSchema.index({ userId: 1, doshaType: 1 });
doshaReportSchema.index({ userId: 1, severity: 1 });
doshaReportSchema.index({ expiresAt: 1 });

export const DoshaReportModel = mongoose.model<IDoshaReport>("DoshaReport", doshaReportSchema);
