const mongoose = require("mongoose");

const birthChartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    chartName: {
      type: String,
      default: "My Birth Chart",
    },
    chartData: {
      houses: { type: Array, default: [] },
      planets: { type: Array, default: [] },
      ascendant: { type: Object, default: {} },
      moonSign: { type: String },
      sunSign: { type: String },
      nakshatra: { type: String },
    },
    chartImage: { type: String },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

birthChartSchema.index({ userId: 1, isDeleted: 1 });
birthChartSchema.index({ profileId: 1 });

module.exports = mongoose.model("BirthChart", birthChartSchema);
