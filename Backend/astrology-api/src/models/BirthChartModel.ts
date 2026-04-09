import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBirthChart extends Document {
  userId: Types.ObjectId;
  profileId: Types.ObjectId;
  chartName: string;
  chartData: Record<string, unknown>;
  chartImage?: string;
  generatedAt: Date;
  isDeleted: boolean;
}

const birthChartSchema = new Schema<IBirthChart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    profileId: { type: Schema.Types.ObjectId, ref: "UserProfile", required: true },
    chartName: { type: String, default: "My Birth Chart" },
    chartData: { type: Schema.Types.Mixed, default: {} },
    chartImage: { type: String },
    generatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

birthChartSchema.index({ userId: 1, isDeleted: 1 });
birthChartSchema.index({ profileId: 1 });

export const BirthChartModel = mongoose.model<IBirthChart>("BirthChart", birthChartSchema);
