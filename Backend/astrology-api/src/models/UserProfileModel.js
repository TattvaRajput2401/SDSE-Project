const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    personalInfo: {
      name: { type: String, required: true, trim: true },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
      },
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

module.exports = mongoose.model("UserProfile", userProfileSchema);
