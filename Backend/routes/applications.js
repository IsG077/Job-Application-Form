const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const JobApplication = require("../models/JobApplication");
const {
  validateApplication,
  handleValidationErrors,
} = require("../middleware/validate");

// ─── Multer setup (resume upload) ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    // e.g. resume-1719556800000-Jane_Smith.pdf
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `resume-${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word documents are allowed"));
    }
  },
});

// ─── POST /api/applications ──────────────────────────────────────────────────
router.post(
  "/",
  upload.single("resume"),        // ← parses multipart/form-data, saves file
  validateApplication,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { fullName, email, phone, position, experience, coverLetter } =
        req.body;

      const application = new JobApplication({
        fullName,
        email,
        phone,
        position,
        experience,
        coverLetter,
        resumeFile: req.file ? req.file.filename : null,  // ← save filename
      });

      const saved = await application.save();

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: saved,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "An application with this email already exists",
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// ─── GET /api/applications ───────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, position, experience, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (experience) filter.experience = experience;
    if (position) filter.position = new RegExp(position, "i");
    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { position: new RegExp(search, "i") },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [applications, total] = await Promise.all([
      JobApplication.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      JobApplication.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

// ─── GET /api/applications/:id ───────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, data: application });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid application ID format" });
    }
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

// ─── PATCH /api/applications/:id/status ─────────────────────────────────────
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "reviewing", "accepted", "rejected"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, message: `Status updated to "${status}"`, data: application });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid application ID format" });
    }
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

// ─── DELETE /api/applications/:id ───────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid application ID format" });
    }
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

module.exports = router;
