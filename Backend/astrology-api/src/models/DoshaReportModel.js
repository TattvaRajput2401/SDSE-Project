const mongoose = require("mongoose");

const doshaReportSchema = new mongoose.Schema(
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
    doshaType: {
      type: String,
      enum: ["manglik", "kalsarp", "sadesati", "pitradosh", "nadi"],
      required: true,
    },
    reportData: {
      type: Object,
      required: true,
    },
    isPresent: {
      type: Boolean,
      default: false,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    remedies: { type: [String], default: [] },
    cachedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

doshaReportSchema.index({ userId: 1, doshaType: 1 });
doshaReportSchema.index({ userId: 1, severity: 1 });
doshaReportSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("DoshaReport", doshaReportSchema);
