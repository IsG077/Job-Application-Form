import { useState, useRef } from "react";
import "./job.css";

const API_URL = "http://localhost:5000/api/applications";

const initialState = {
  fullName: "",
  email: "",
  phone: "",
  position: "",
  experience: "",
  coverLetter: "",
};

export default function JobApplicationForm() {
  const [formData, setFormData] = useState(initialState);
  const [resume, setResume] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setResume(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Use FormData to support file upload alongside JSON fields
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => payload.append(key, val));
      if (resume) payload.append("resume", resume);

      const res = await fetch(API_URL, {
        method: "POST",
        body: payload, // let browser set multipart Content-Type automatically
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const mapped = {};
          data.errors.forEach(({ field, message }) => {
            mapped[field] = message;
          });
          setFieldErrors(mapped);
        } else {
          setError(data.message || "Something went wrong. Please try again.");
        }
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError("Cannot reach the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-wrapper">
        <div className="form-card success">
          <div className="success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A24B" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2>Application Submitted!</h2>
          <p>
            Thanks, {formData.fullName.split(" ")[0]}. We'll review your
            application and get back to you within 5–7 business days.
          </p>
          <button
            className="btn-reset"
            onClick={() => {
              setFormData(initialState);
              setResume(null);
              setSubmitted(false);
              setError(null);
              setFieldErrors({});
            }}
          >
            Submit another application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="form-card">

        <div className="card-eyebrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
          Careers
        </div>

        <h2>Job Application</h2>
        <p className="subtitle">Tell us a bit about yourself</p>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Personal Info ── */}
          <p className="section-title">Personal Information</p>

          <div className="field">
            <label htmlFor="fullName">Full Name <span className="req">*</span></label>
            <input
              id="fullName"
              name="fullName"
              placeholder="Jane Smith"
              value={formData.fullName}
              onChange={handleChange}
              required
              className={fieldErrors.fullName ? "input-error" : ""}
            />
            {fieldErrors.fullName && <span className="field-error">{fieldErrors.fullName}</span>}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="email">Email <span className="req">*</span></label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className={fieldErrors.email ? "input-error" : ""}
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            <div className="field">
              <label htmlFor="phone">Phone <span className="req">*</span></label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                required
                className={fieldErrors.phone ? "input-error" : ""}
              />
              {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
            </div>
          </div>

          {/* ── Role Details ── */}
          <p className="section-title">Role Details</p>

          <div className="field">
            <label htmlFor="position">Position Applying For <span className="req">*</span></label>
            <input
              id="position"
              name="position"
              placeholder="e.g. Software Engineer"
              value={formData.position}
              onChange={handleChange}
              required
              className={fieldErrors.position ? "input-error" : ""}
            />
            {fieldErrors.position && <span className="field-error">{fieldErrors.position}</span>}
          </div>

          <div className="field">
            <label htmlFor="experience">Years of Experience <span className="req">*</span></label>
            <select
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
              className={fieldErrors.experience ? "input-error" : ""}
            >
              <option value="">Select…</option>
              <option value="0-1">0–1 years</option>
              <option value="2-4">2–4 years</option>
              <option value="5+">5+ years</option>
            </select>
            {fieldErrors.experience && <span className="field-error">{fieldErrors.experience}</span>}
          </div>

          {/* ── Cover Letter ── */}
          <p className="section-title">Cover Letter</p>

          <div className="field">
            <label htmlFor="coverLetter">Why do you want to join us?</label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              rows="4"
              placeholder="Share what excites you about this role and what you'd bring to the team…"
              value={formData.coverLetter}
              onChange={handleChange}
            />
          </div>

          {/* ── Resume Upload ── */}
          <p className="section-title">Resume / CV</p>

          <div className="field">
            <label
              className="upload-label"
              htmlFor="resume"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{resume ? resume.name : "Upload PDF or DOCX (max 5 MB)"}</span>
            </label>
            <input
              ref={fileInputRef}
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Submitting…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Submit Application
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
