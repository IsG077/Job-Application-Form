import { useState } from "react";
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
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error on change
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle validation errors from backend
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
      <div className="form-card success">
        <h2>Application Sent</h2>
        <p>
          Thanks, {formData.fullName.split(" ")[0]}. We'll review your
          application and get back to you soon.
        </p>
        <button
          onClick={() => {
            setFormData(initialState);
            setSubmitted(false);
            setError(null);
            setFieldErrors({});
          }}
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <div className="form-card">
      <h2>Job Application</h2>
      <p className="subtitle">Tell us a bit about yourself</p>

      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <label>Full Name</label>
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className={fieldErrors.fullName ? "input-error" : ""}
        />
        {fieldErrors.fullName && (
          <span className="field-error">{fieldErrors.fullName}</span>
        )}

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={fieldErrors.email ? "input-error" : ""}
        />
        {fieldErrors.email && (
          <span className="field-error">{fieldErrors.email}</span>
        )}

        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className={fieldErrors.phone ? "input-error" : ""}
        />
        {fieldErrors.phone && (
          <span className="field-error">{fieldErrors.phone}</span>
        )}

        <label>Position Applying For</label>
        <input
          name="position"
          value={formData.position}
          onChange={handleChange}
          required
          className={fieldErrors.position ? "input-error" : ""}
        />
        {fieldErrors.position && (
          <span className="field-error">{fieldErrors.position}</span>
        )}

        <label>Years of Experience</label>
        <select
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          required
          className={fieldErrors.experience ? "input-error" : ""}
        >
          <option value="">Select</option>
          <option value="0-1">0–1 years</option>
          <option value="2-4">2–4 years</option>
          <option value="5+">5+ years</option>
        </select>
        {fieldErrors.experience && (
          <span className="field-error">{fieldErrors.experience}</span>
        )}

        <label>Cover Letter</label>
        <textarea
          name="coverLetter"
          rows="4"
          value={formData.coverLetter}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
