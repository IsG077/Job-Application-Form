const { body, validationResult } = require("express-validator");

const validateApplication = [
  body("fullName")
    .trim()
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Full name must be 2–100 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address"),
    // ↑ REMOVED .normalizeEmail() — it was lowercasing before Mongoose regex ran,
    //   causing valid emails like Sameersingh123@gmail.com to fail validation.

  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}$/)
    // ↑ CHANGED {7,14} → {6,14} so plain 9-digit numbers like 999999999 are accepted
    .withMessage("Please provide a valid phone number"),

  body("position")
    .trim()
    .notEmpty().withMessage("Position is required")
    .isLength({ max: 100 }).withMessage("Position cannot exceed 100 characters"),

  body("experience")
    .notEmpty().withMessage("Experience is required")
    .isIn(["0-1", "2-4", "5+"]).withMessage("Invalid experience value"),

  body("coverLetter")
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage("Cover letter cannot exceed 5000 characters"),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = { validateApplication, handleValidationErrors };
