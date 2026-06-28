const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      // FIXED: regex now works after Mongoose lowercases the email
      match: [
        /^[a-z0-9]+([._-]?[a-z0-9]+)*@[a-z0-9]+([.-]?[a-z0-9]+)*(\.[a-z]{2,})+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      // FIXED: {6,14} so plain 9-digit numbers pass (matches validator regex)
      match: [
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}$/,
        "Please provide a valid phone number",
      ],
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
      maxlength: [100, "Position cannot exceed 100 characters"],
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
      enum: {
        values: ["0-1", "2-4", "5+"],
        message: "Experience must be one of: 0-1, 2-4, 5+",
      },
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: [5000, "Cover letter cannot exceed 5000 characters"],
      default: "",
    },
    // NEW: store resume filename (saved to /uploads/ folder by multer)
    resumeFile: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
