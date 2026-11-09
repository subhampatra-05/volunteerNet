import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const CATEGORIES = ["Technical", "Social Service", "Workshop", "Cultural", "Sports", "Other"];

const POSTER_PRESETS = [
  {
    name: "Tech / Hackathon",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Social Service",
    url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Workshop / Seminar",
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Cultural Fest",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Sports Meet",
    url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
  });

  const [posterImage, setPosterImage] = useState("");
  const [posterInputUrl, setPosterInputUrl] = useState("");
  const [additionalImages, setAdditionalImages] = useState([]);
  const [extraImageUrl, setExtraImageUrl] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Poster file upload handler
  const handlePosterFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file for the poster");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setPosterImage(event.target.result);
      setPosterInputUrl("");
      setError("");
    };
    reader.readAsDataURL(file);
  };

  // Additional images file upload handler (multiple files)
  const handleExtraFilesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setAdditionalImages((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Add extra image via URL
  const handleAddExtraUrl = (e) => {
    e.preventDefault();
    if (!extraImageUrl.trim()) return;
    setAdditionalImages((prev) => [...prev, extraImageUrl.trim()]);
    setExtraImageUrl("");
  };

  const removeExtraImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!posterImage || !posterImage.trim()) {
      setError("An event poster image is mandatory. Please upload a file or choose an image URL.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/events", {
        ...form,
        capacity: Number(form.capacity),
        posterImage: posterImage.trim(),
        images: additionalImages,
      });
      setSuccess(true);
      setTimeout(() => navigate("/my-events"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content flex-center">
        <div className="container flex-center">
          <div className="glass-card create-event-card animate-fade-in">
            <div className="form-header text-center">
              <h2>Host a New Event</h2>
              <p className="form-subtitle">
                Submit your campus event for admin approval before it goes live on the feed.
              </p>
            </div>

            {success ? (
              <div className="alert-success text-center">
                🎉 Event submitted successfully! Redirecting to your events...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="event-form">
                {error && <div className="alert-error">{error}</div>}

                <div className="form-group">
                  <label htmlFor="title">Event Title *</label>
                  <input
                    id="title"
                    name="title"
                    className="form-control"
                    placeholder="e.g. Annual Campus Hackathon 2026"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Event Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    rows="4"
                    placeholder="Describe the purpose, agenda, and volunteer roles for your event..."
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      className="form-control"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group flex-1">
                    <label htmlFor="capacity">Volunteer / Participant Capacity *</label>
                    <input
                      id="capacity"
                      type="number"
                      name="capacity"
                      min="1"
                      className="form-control"
                      placeholder="e.g. 50"
                      value={form.capacity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="date">Event Date *</label>
                    <input
                      id="date"
                      type="date"
                      name="date"
                      className="form-control"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label htmlFor="time">Time *</label>
                    <input
                      id="time"
                      type="text"
                      name="time"
                      className="form-control"
                      placeholder="e.g. 03:00 PM"
                      value={form.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location / Venue *</label>
                  <input
                    id="location"
                    name="location"
                    className="form-control"
                    placeholder="e.g. Main Auditorium / Lab 204"
                    value={form.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* 1. MANDATORY POSTER SECTION */}
                <div className="image-section-box mandatory-box">
                  <div className="image-section-header">
                    <div>
                      <label className="section-title">
                        Event Poster Image * <span className="tag-required">Mandatory</span>
                      </label>
                      <p className="section-hint">
                        This poster will appear as the visual background for your event card on the public feed.
                      </p>
                    </div>
                  </div>

                  {posterImage ? (
                    <div className="poster-preview-card">
                      <div
                        className="poster-preview-bg"
                        style={{ backgroundImage: `url(${posterImage})` }}
                      >
                        <div className="poster-preview-overlay">
                          <span className="badge-poster-ok">✓ Poster Attached</span>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm remove-poster-btn"
                            onClick={() => {
                              setPosterImage("");
                              setPosterInputUrl("");
                            }}
                          >
                            Change Poster
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="poster-upload-options">
                      <div className="upload-btn-row">
                        <label className="btn btn-secondary upload-file-btn">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                          Upload Poster from Device
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handlePosterFileUpload}
                          />
                        </label>
                        <span className="or-divider">or paste URL below</span>
                      </div>

                      <div className="url-input-row">
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://example.com/poster.jpg"
                          value={posterInputUrl}
                          onChange={(e) => setPosterInputUrl(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={!posterInputUrl.trim()}
                          onClick={() => {
                            if (posterInputUrl.trim()) {
                              setPosterImage(posterInputUrl.trim());
                            }
                          }}
                        >
                          Use URL
                        </button>
                      </div>

                      {/* Presets */}
                      <div className="presets-group">
                        <span className="presets-label">Quick poster templates:</span>
                        <div className="presets-chips">
                          {POSTER_PRESETS.map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              className="preset-chip"
                              onClick={() => {
                                setPosterImage(p.url);
                                setPosterInputUrl("");
                              }}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. OPTIONAL ADDITIONAL IMAGES (Location, Past Events, etc.) */}
                <div className="image-section-box optional-box">
                  <div className="image-section-header">
                    <div>
                      <label className="section-title">
                        Additional Event Images <span className="tag-optional">Optional</span>
                      </label>
                      <p className="section-hint">
                        Add multiple photos for venue locations, previous year event memories, or stage layouts. Viewable inside the event details.
                      </p>
                    </div>
                    {additionalImages.length > 0 && (
                      <span className="badge-count">
                        {additionalImages.length} {additionalImages.length === 1 ? "Image" : "Images"} Added
                      </span>
                    )}
                  </div>

                  <div className="extra-images-controls">
                    <label className="btn btn-secondary upload-file-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      + Upload Multiple Photos
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleExtraFilesUpload}
                      />
                    </label>

                    <div className="extra-url-row">
                      <input
                        type="url"
                        className="form-control"
                        placeholder="Or paste location / past event image URL..."
                        value={extraImageUrl}
                        onChange={(e) => setExtraImageUrl(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={!extraImageUrl.trim()}
                        onClick={handleAddExtraUrl}
                      >
                        + Add Image
                      </button>
                    </div>
                  </div>

                  {additionalImages.length > 0 && (
                    <div className="thumbnails-grid">
                      {additionalImages.map((imgUrl, idx) => (
                        <div key={idx} className="thumb-item">
                          <img src={imgUrl} alt={`Event attachment ${idx + 1}`} />
                          <button
                            type="button"
                            className="thumb-delete-btn"
                            onClick={() => removeExtraImage(idx)}
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg submit-event-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting Event..." : "Submit Event for Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .create-event-card {
          width: 100%;
          max-width: 680px;
          padding: 2.5rem 2rem;
          margin: 1.5rem 0;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 14px;
          box-shadow: var(--shadow-md);
        }

        .form-header h2 {
          font-size: 2rem;
          margin-bottom: 0.35rem;
          color: #172554;
        }

        .form-subtitle {
          color: #475569;
          font-size: 0.95rem;
          margin-bottom: 1.75rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .flex-1 {
          flex: 1;
        }

        textarea.form-control {
          resize: vertical;
        }

        select.form-control option {
          background: #ffffff;
          color: #0f172a;
        }

        /* Image sections */
        .image-section-box {
          border-radius: 12px;
          padding: 1.25rem 1.4rem;
          margin: 1.25rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .mandatory-box {
          background: #fbfbfa;
          border: 1.5px dashed #cbd5e1;
        }

        .optional-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .image-section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #172554;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.2rem;
        }

        .tag-required {
          font-size: 0.7rem;
          font-weight: 700;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }

        .tag-optional {
          font-size: 0.7rem;
          font-weight: 600;
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #cbd5e1;
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }

        .section-hint {
          font-size: 0.825rem;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }

        .badge-count {
          font-size: 0.775rem;
          font-weight: 700;
          background: #eef6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }

        /* Poster Preview */
        .poster-preview-card {
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(23, 37, 84, 0.12);
        }

        .poster-preview-bg {
          width: 100%;
          height: 190px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .poster-preview-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.75) 100%);
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 1rem 1.25rem;
        }

        .badge-poster-ok {
          background: #10b981;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-full);
        }

        .remove-poster-btn {
          background: #ffffff;
          color: #172554;
          font-weight: 600;
        }

        .poster-upload-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .upload-btn-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .upload-file-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 600;
        }

        .or-divider {
          font-size: 0.825rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .url-input-row,
        .extra-url-row {
          display: flex;
          gap: 0.5rem;
        }

        .presets-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-top: 0.25rem;
        }

        .presets-label {
          font-size: 0.775rem;
          font-weight: 600;
          color: #64748b;
        }

        .presets-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .preset-chip {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-full);
          padding: 0.25rem 0.65rem;
          font-size: 0.775rem;
          font-weight: 600;
          color: #172554;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .preset-chip:hover {
          border-color: #3b82f6;
          background: #eef6ff;
          color: #1d4ed8;
        }

        /* Extra images controls & thumbnails */
        .extra-images-controls {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .thumbnails-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
          gap: 0.65rem;
          margin-top: 0.5rem;
        }

        .thumb-item {
          position: relative;
          aspect-ratio: 16 / 11;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .thumb-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .thumb-delete-btn {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.75);
          color: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .thumb-delete-btn:hover {
          background: #dc2626;
        }

        .submit-event-btn {
          margin-top: 1rem;
        }

        @media (max-width: 640px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }
          .url-input-row,
          .extra-url-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
